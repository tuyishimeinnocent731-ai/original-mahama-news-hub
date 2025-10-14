#!/usr/bin/env bash
set -euo pipefail

BRANCH="feature/advanced-apis-integration"

echo "This script will add advanced APIs, middleware, migrations, Dockerfiles, and frontend fixes."
echo "Make sure you run this from your local repository root."
read -p "Type YES to proceed: " CONFIRM
if [ "$CONFIRM" != "YES" ]; then
  echo "Aborted."
  exit 1
fi

# Ensure git repo
if [ ! -d ".git" ]; then
  echo "Error: not a git repository root. Abort."
  exit 1
fi

# Create and switch to branch
git fetch origin || true
if git rev-parse --verify --quiet "$BRANCH" >/dev/null; then
  git checkout "$BRANCH"
  git pull origin "$BRANCH" || true
else
  git checkout -b "$BRANCH"
fi

# Create directories
mkdir -p backend/controllers backend/routes backend/middleware backend/uploads services components migrations

echo "Writing files..."

# backend/package.json
cat > backend/package.json <<'EOF'
{
  "name": "mahamanews-backend",
  "version": "1.0.0",
  "description": "Mahama News Hub - backend",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "bcryptjs": "^2.4.3",
    "compression": "^1.7.4",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-rate-limit": "^6.10.0",
    "helmet": "^7.0.0",
    "ioredis": "^5.3.2",
    "jsonwebtoken": "^9.0.0",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1",
    "mysql2": "^3.4.0",
    "uuid": "^9.0.0",
    "winston": "^3.9.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  }
}
EOF

# backend/server.js
cat > backend/server.js <<'EOF'
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { initLogger, requestLogger } = require('./middleware/logger');
const { attachSecureHeaders } = require('./middleware/secureHeaders');
const { initRedis } = require('./middleware/cacheMiddleware');

const logger = initLogger();

const app = express();

// Initialize Redis (optional)
const redisClient = initRedis();

// Security & performance middleware
app.use(helmet());
app.use(attachSecureHeaders);
app.use(compression());

// Logging: morgan -> winston
app.use(requestLogger);

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Body parsers
app.use(express.json({ limit: '16mb' }));
app.use(express.urlencoded({ extended: true, limit: '16mb' }));

// IP address attach
app.use((req, res, next) => {
  req.ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  next();
});

// Global rate limiter
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX || '120', 10),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ message: 'Too many requests. Please try again later.' });
  }
});
app.use('/api/', limiter);

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routes (try/catch to avoid crash on partial deploy)
try {
  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/users', require('./routes/userRoutes'));
  app.use('/api/articles', require('./routes/articleRoutes'));
  app.use('/api/ads', require('./routes/adRoutes'));
  app.use('/api/ai', require('./routes/aiRoutes'));
  app.use('/api/dashboard', require('./routes/dashboardRoutes'));
  app.use('/api/site', require('./routes/siteRoutes'));
  app.use('/api/payments', require('./routes/paymentRoutes'));

  app.use('/api/recommendations', require('./routes/recommendations'));
  app.use('/api/search', require('./routes/search'));
  app.use('/api/external', require('./routes/externalRoutes'));
  app.use('/api/bookmarks', require('./routes/bookmarkRoutes'));

  app.use('/api/v1', require('./routes/publicApiRoutes'));
} catch (err) {
  logger.warn('Some routes could not be mounted (maybe missing files).', err.message || err);
}

// Health endpoints
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));
app.get('/ready', async (req, res) => {
  try {
    const pool = require('./config/db');
    await pool.query('SELECT 1');
    if (redisClient) await redisClient.ping();
    res.json({ ready: true });
  } catch (err) {
    logger.error('Readiness check failed', err);
    res.status(503).json({ ready: false, error: err.message });
  }
});

// Serve frontend in production (expects /dist created by Vite)
const CLIENT_DIST = path.join(__dirname, '..', 'dist');
if (process.env.SERVE_FRONTEND === 'true' || process.env.NODE_ENV === 'production') {
  app.use(express.static(CLIENT_DIST));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) return res.status(404).json({ message: 'Not found' });
    const indexHtml = path.join(CLIENT_DIST, 'index.html');
    res.sendFile(indexHtml, (err) => {
      if (err) res.status(500).send('Error loading application');
    });
  });
}

// Error handling
app.use((err, req, res, next) => {
  logger.error(err.stack || err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({ message });
});

const PORT = parseInt(process.env.PORT || '5000', 10);
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
EOF

# backend/middleware/logger.js
cat > backend/middleware/logger.js <<'EOF'
const winston = require('winston');
const morgan = require('morgan');

function initLogger() {
  const level = process.env.LOG_LEVEL || 'info';
  const logger = winston.createLogger({
    level,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.Console({ format: winston.format.simple() })
    ]
  });
  return logger;
}

// morgan middleware wired to winston
function requestLogger(req, res, next) {
  const logger = initLogger();
  const format = process.env.MORGAN_FORMAT || 'combined';
  return morgan(format, {
    stream: {
      write: (message) => {
        logger.info(message.trim());
      }
    }
  })(req, res, next);
}

module.exports = { initLogger, requestLogger };
EOF

# backend/middleware/secureHeaders.js
cat > backend/middleware/secureHeaders.js <<'EOF'
const helmet = require('helmet');

function attachSecureHeaders(req, res, next) {
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false
  })(req, res, next);
}

module.exports = { attachSecureHeaders };
EOF

# backend/middleware/cacheMiddleware.js
cat > backend/middleware/cacheMiddleware.js <<'EOF'
const Redis = require('ioredis');

let client = null;

function initRedis() {
  const url = process.env.REDIS_URL || process.env.REDIS_HOST;
  if (!url) return null;
  if (client) return client;
  client = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 2 });
  client.on('error', (err) => { console.error('Redis error', err); });
  client.connect().catch(err => { console.error('Redis connect error', err); });
  return client;
}

async function cacheGetOrSet(key, ttlSeconds, fn) {
  if (!client) return fn();
  try {
    const cached = await client.get(key);
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { /* ignore */ }
    }
    const result = await fn();
    try { await client.set(key, JSON.stringify(result), 'EX', ttlSeconds || 60); } catch (e) {}
    return result;
  } catch (err) {
    return fn();
  }
}

module.exports = { initRedis, cacheGetOrSet, _redisClient: () => client };
EOF

# backend/middleware/apiKeyAuth.js
cat > backend/middleware/apiKeyAuth.js <<'EOF'
const pool = require('../config/db');

const apiKeyAuth = async (req, res, next) => {
  try {
    const incoming = req.headers['x-api-key'] || req.query.api_key;
    if (!incoming) return res.status(401).json({ message: 'API key required' });

    if (process.env.PUBLIC_API_KEY && incoming === process.env.PUBLIC_API_KEY) {
      return next();
    }

    try {
      const [rows] = await pool.query('SELECT id, name, active FROM api_keys WHERE api_key = ? LIMIT 1', [incoming]);
      if (rows && rows.length > 0 && rows[0].active) return next();
    } catch (dbErr) {
      console.warn('apiKeyAuth db check failed', dbErr.message || dbErr);
    }

    return res.status(403).json({ message: 'Invalid API key' });
  } catch (err) {
    console.error('apiKeyAuth error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { apiKeyAuth };
EOF

# backend/controllers/recommendationController.js
cat > backend/controllers/recommendationController.js <<'EOF'
const pool = require('../config/db');

const getRecommendations = async (req, res, next) => {
  try {
    const userId = req.query.userId;
    const count = parseInt(req.query.count || '10', 10);

    if (!userId) {
      const [rows] = await pool.query('SELECT * FROM articles WHERE (scheduled_for IS NULL OR scheduled_for <= NOW()) ORDER BY views DESC LIMIT ?', [count]);
      return res.json(rows);
    }

    const [rows] = await pool.query('SELECT preferred_categories, preferred_tags FROM user_settings WHERE user_id = ? LIMIT 1', [userId]);
    const settings = rows && rows.length > 0 ? rows[0] : null;
    const categories = settings && settings.preferred_categories ? JSON.parse(settings.preferred_categories) : [];
    const tags = settings && settings.preferred_tags ? JSON.parse(settings.preferred_tags) : [];

    let base = 'SELECT *, (CASE WHEN LOWER(category) IN (?) THEN 2 ELSE 0 END)';
    const params = [categories.map(c => c.toLowerCase())];

    if (tags.length > 0) {
      base += ' + (CASE ';
      base += tags.map(() => ' WHEN tags LIKE ? THEN 1').join('');
      base += ' ELSE 0 END)';
      params.push(...tags.map(t => `%${t}%`));
    } else {
      base += ' AS score';
    }

    base += ' FROM articles WHERE (scheduled_for IS NULL OR scheduled_for <= NOW()) ORDER BY score DESC, published_at DESC LIMIT ?';
    params.push(count);

    const [articles] = await pool.query(base, params);

    if (!articles || articles.length === 0) {
      const [fallback] = await pool.query('SELECT * FROM articles WHERE (scheduled_for IS NULL OR scheduled_for <= NOW()) ORDER BY views DESC LIMIT ?', [count]);
      return res.json(fallback);
    }
    res.json(articles);
  } catch (err) {
    next(err);
  }
};

module.exports = { getRecommendations };
EOF

# backend/controllers/searchController.js
cat > backend/controllers/searchController.js <<'EOF'
const pool = require('../config/db');

const search = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.status(400).json({ message: 'q parameter is required' });

    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const offset = (page - 1) * limit;

    const useFulltext = process.env.USE_FULLTEXT === 'true';

    if (useFulltext) {
      const [rows] = await pool.query(
        `SELECT *, MATCH(title, description, body) AGAINST(?) AS score
         FROM articles
         WHERE MATCH(title, description, body) AGAINST(? IN NATURAL LANGUAGE MODE)
           AND (scheduled_for IS NULL OR scheduled_for <= NOW())
         ORDER BY score DESC
         LIMIT ? OFFSET ?`,
        [q, q, limit, offset]
      );
      const [countRes] = await pool.query(
        `SELECT COUNT(*) as total FROM articles WHERE MATCH(title, description, body) AGAINST(? IN NATURAL LANGUAGE MODE) AND (scheduled_for IS NULL OR scheduled_for <= NOW())`,
        [q]
      );
      const total = countRes[0] ? countRes[0].total : 0;
      return res.json({ articles: rows, totalPages: Math.ceil(total / limit), currentPage: page });
    } else {
      const likeQ = `%${q}%`;
      const [rows] = await pool.query(
        `SELECT * FROM articles WHERE (title LIKE ? OR description LIKE ? OR body LIKE ?) AND (scheduled_for IS NULL OR scheduled_for <= NOW()) ORDER BY published_at DESC LIMIT ? OFFSET ?`,
        [likeQ, likeQ, likeQ, limit, offset]
      );
      const [countRes] = await pool.query(
        `SELECT COUNT(*) as total FROM articles WHERE (title LIKE ? OR description LIKE ? OR body LIKE ?) AND (scheduled_for IS NULL OR scheduled_for <= NOW())`,
        [likeQ, likeQ, likeQ]
      );
      const total = countRes[0] ? countRes[0].total : 0;
      return res.json({ articles: rows, totalPages: Math.ceil(total / limit), currentPage: page });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = { search };
EOF

# backend/controllers/externalController.js
cat > backend/controllers/externalController.js <<'EOF'
const axios = require('axios');
const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const syncExternal = async (req, res, next) => {
  try {
    const source = (req.body.source || 'all').toLowerCase();
    const inserted = [];

    const upsertArticle = async (a) => {
      if (!a.url) return null;
      const [exists] = await pool.query('SELECT id FROM articles WHERE url = ? LIMIT 1', [a.url]);
      if (exists && exists.length > 0) return null;
      const id = `article-${uuidv4()}`;
      const article = {
        id,
        title: a.title || 'Untitled',
        description: a.description || '',
        body: a.content || a.description || '',
        author: a.author || 'External',
        url: a.url,
        urlToImage: a.urlToImage || a.image || null,
        category: a.source_category || 'World',
        tags: JSON.stringify(a.tags || []),
        published_at: a.publishedAt || new Date(),
        created_at: new Date()
      };
      await pool.query('INSERT INTO articles SET ?', article);
      return article;
    };

    if ((source === 'newsapi' || source === 'all') && process.env.NEWSAPI_KEY) {
      const key = process.env.NEWSAPI_KEY;
      const response = await axios.get('https://newsapi.org/v2/top-headlines', { params: { language: 'en', pageSize: 50, apiKey: key }});
      for (const it of (response.data.articles || [])) {
        const up = await upsertArticle(it);
        if (up) inserted.push(up);
      }
    }

    if ((source === 'gnews' || source === 'all') && process.env.GNEWS_KEY) {
      const key = process.env.GNEWS_KEY;
      const response = await axios.get('https://gnews.io/api/v4/top-headlines', { params: { token: key, lang: 'en', max: 50 }});
      for (const it of (response.data.articles || [])) {
        const up = await upsertArticle(it);
        if (up) inserted.push(up);
      }
    }

    res.json({ inserted: inserted.length });
  } catch (err) {
    next(err);
  }
};

module.exports = { syncExternal };
EOF

# backend/controllers/bookmarkController.js
cat > backend/controllers/bookmarkController.js <<'EOF'
const pool = require('../config/db');

const getBookmarks = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    const [rows] = await pool.query('SELECT b.id, b.article_id, a.title, a.url, a.urlToImage, b.created_at FROM bookmarks b JOIN articles a ON a.id = b.article_id WHERE b.user_id = ? ORDER BY b.created_at DESC', [user.id]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

const addBookmark = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    const { articleId } = req.body;
    if (!articleId) return res.status(400).json({ message: 'articleId required' });

    const [exists] = await pool.query('SELECT id FROM bookmarks WHERE user_id = ? AND article_id = ? LIMIT 1', [user.id, articleId]);
    if (exists && exists.length > 0) return res.status(200).json({ message: 'Already bookmarked' });

    const insert = { user_id: user.id, article_id: articleId, created_at: new Date() };
    const [result] = await pool.query('INSERT INTO bookmarks SET ?', insert);
    res.status(201).json({ id: result.insertId, ...insert });
  } catch (err) {
    next(err);
  }
};

const removeBookmark = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    const id = req.params.id;
    await pool.query('DELETE FROM bookmarks WHERE id = ? AND user_id = ?', [id, user.id]);
    res.json({ message: 'Bookmark removed' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getBookmarks, addBookmark, removeBookmark };
EOF

# backend/routes/recommendations.js
cat > backend/routes/recommendations.js <<'EOF'
const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/recommendationController');

router.get('/', getRecommendations);

module.exports = router;
EOF

# backend/routes/search.js
cat > backend/routes/search.js <<'EOF'
const express = require('express');
const router = express.Router();
const { search } = require('../controllers/searchController');

router.get('/', search);

module.exports = router;
EOF

# backend/routes/externalRoutes.js
cat > backend/routes/externalRoutes.js <<'EOF'
const express = require('express');
const router = express.Router();
const { syncExternal } = require('../controllers/externalController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/sync', protect, admin, syncExternal);

module.exports = router;
EOF

# backend/routes/bookmarkRoutes.js
cat > backend/routes/bookmarkRoutes.js <<'EOF'
const express = require('express');
const router = express.Router();
const { getBookmarks, addBookmark, removeBookmark } = require('../controllers/bookmarkController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getBookmarks);
router.post('/', addBookmark);
router.delete('/:id', removeBookmark);

module.exports = router;
EOF

# services/apiService.ts
cat > services/apiService.ts <<'EOF'
export const API_URL = (import.meta.env?.VITE_API_URL as string) || 'http://localhost:5000';

const getAuthToken = () => {
  try {
    const auth = localStorage.getItem('auth');
    if (auth) return JSON.parse(auth).token;
  } catch (err) {
    console.warn('apiService: failed to parse token', err);
  }
  return null;
};

const buildHeaders = (isJson = true) => {
  const headers: Record<string, string> = {};
  if (isJson) headers['Content-Type'] = 'application/json';
  const token = getAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const api = {
  get: async <T>(endpoint: string): Promise<T> => {
    const res = await fetch(`${API_URL}${endpoint}`, { headers: buildHeaders(true), credentials: 'include' });
    if (!res.ok) {
      const txt = await res.text();
      let message = txt;
      try { message = JSON.parse(txt).message || txt; } catch {}
      throw new Error(`HTTP ${res.status}: ${message}`);
    }
    return res.json();
  },

  post: async <T>(endpoint: string, body: any, isJson = true): Promise<T> => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: buildHeaders(isJson),
      credentials: 'include',
      body: isJson ? JSON.stringify(body) : body
    });
    if (!res.ok) {
      const txt = await res.text();
      let message = txt;
      try { message = JSON.parse(txt).message || txt; } catch {}
      throw new Error(`HTTP ${res.status}: ${message}`);
    }
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) return res.json();
    return (await res.text()) as unknown as T;
  },

  put: async <T>(endpoint: string, body: any): Promise<T> => {
    const res = await fetch(`${API_URL}${endpoint}`, { method: 'PUT', headers: buildHeaders(true), credentials: 'include', body: JSON.stringify(body) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  delete: async <T>(endpoint: string): Promise<T> => {
    const res = await fetch(`${API_URL}${endpoint}`, { method: 'DELETE', headers: buildHeaders(true), credentials: 'include' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }
};
EOF

# services/newsService.ts
cat > services/newsService.ts <<'EOF'
import { api } from './apiService';
import { Article } from '../types';

export const getRecommendations = async (userId: string, count = 10): Promise<Article[]> => {
  return api.get(`/api/recommendations?userId=${encodeURIComponent(userId)}&count=${count}`);
};

export const searchArticles = async (query: string, filters: Record<string, any> = {}, page = 1, limit = 10) => {
  const params = new URLSearchParams();
  params.append('q', query);
  params.append('page', String(page));
  params.append('limit', String(limit));
  Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, String(v)); });
  return api.get(`/api/search?${params.toString()}`);
};

export const syncExternalNews = async (source?: string) => {
  return api.post('/api/external/sync', { source });
};

export const getTrendingArticles = async (limit = 10) => {
  return api.get(`/api/articles?category=World&page=1&limit=${limit}`);
};

export const addBookmark = async (articleId: string) => api.post('/api/bookmarks', { articleId });
export const removeBookmark = async (bookmarkId: string) => api.delete(`/api/bookmarks/${encodeURIComponent(bookmarkId)}`);
export const getBookmarks = async () => api.get('/api/bookmarks');
EOF

# components/LoginModal.tsx
cat > components/LoginModal.tsx <<'EOF'
import React, { useState } from 'react';
import Modal from './Modal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<boolean> | void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    try {
      await onLogin(email, password);
      onClose && onClose();
    } catch (err) {
      console.error('Login error', err);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Login to your account">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Your email
          </label>
          <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required
                 className="block w-full px-3 py-2 bg-card border border-border rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"/>
        </div>
        <div>
          <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Your password
          </label>
          <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required
                 className="block w-full px-3 py-2 bg-card border border-border rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"/>
        </div>
        <button type="submit" className="w-full text-white bg-yellow-500 hover:bg-yellow-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
          Login
        </button>
      </form>
    </Modal>
  );
};

export default LoginModal;
EOF

# migrations SQL
cat > migrations/001_create_bookmarks_api_keys_and_fulltext.sql <<'EOF'
-- Creates bookmarks and api_keys tables and suggests adding FULLTEXT index for articles

CREATE TABLE IF NOT EXISTS bookmarks (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  article_id VARCHAR(100) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (user_id),
  INDEX (article_id)
);

CREATE TABLE IF NOT EXISTS api_keys (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  api_key VARCHAR(255) NOT NULL UNIQUE,
  active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Optional: add FULLTEXT index on articles for better search
ALTER TABLE articles
  ADD FULLTEXT idx_fulltext_title_description_body (title, description, body);
EOF

# Dockerfiles and docker-compose
cat > backend/Dockerfile <<'EOF'
FROM node:18-alpine

WORKDIR /app

COPY backend/package*.json backend/
RUN npm ci --prefix backend --production

COPY backend/ backend/

RUN mkdir -p /app/uploads

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000
CMD ["node", "backend/server.js"]
EOF

cat > Dockerfile <<'EOF'
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:stable-alpine AS runtime
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

cat > docker-compose.yml <<'EOF'
version: '3.8'
services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD:-rootpassword}
      MYSQL_DATABASE: ${DB_NAME:-mahama_news}
    volumes:
      - db-data:/var/lib/mysql
    ports:
      - "3306:3306"

  redis:
    image: redis:7
    ports:
      - "6379:6379"

  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    depends_on:
      - db
      - redis
    environment:
      - DB_HOST=db
      - DB_USER=${DB_USER:-root}
      - DB_PASSWORD=${DB_PASSWORD:-rootpassword}
      - DB_NAME=${DB_NAME:-mahama_news}
      - JWT_SECRET=${JWT_SECRET:-change_me}
      - NEWSAPI_KEY=${NEWSAPI_KEY}
      - GNEWS_KEY=${GNEWS_KEY}
      - PUBLIC_API_KEY=${PUBLIC_API_KEY}
      - VITE_API_URL=${VITE_API_URL:-http://localhost:5000}
      - REDIS_URL=redis://redis:6379
      - USE_FULLTEXT=${USE_FULLTEXT:-false}
    volumes:
      - ./backend/uploads:/app/uploads
    ports:
      - "5000:5000"

  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    depends_on:
      - backend
    environment:
      - VITE_API_URL=http://localhost:5000
    ports:
      - "3000:80"

volumes:
  db-data:
EOF

# README_DEPLOY.md
cat > README_DEPLOY.md <<'EOF'
````markdown
# Deployment checklist

1) Copy .env.example -> .env and fill DB_*, JWT_SECRET, VITE_API_URL, NEWSAPI_KEY/GNEWS_KEY (optional), and PUBLIC_API_KEY if needed.

2) Install backend dependencies:
   cd backend
   npm install

3) Run migrations (mysql client required):
   mysql -u <user> -p <DB_NAME> < migrations/001_create_bookmarks_api_keys_and_fulltext.sql

4) Build frontend (from repo root):
   npm install
   npm run build

5) Start backend:
   cd backend
   npm start

Or using Docker Compose:
   docker-compose up --build -d

Login/register redirect:
- The frontend LoginModal now calls the App-level onLogin signature (email, password).
- App.tsx already calls handleCategorySelect('World') after successful login/register, so users will be redirected to "World" after auth.

Notes:
- If ALTER TABLE FULLTEXT fails during migration, remove that line and set USE_FULLTEXT=false in .env.
- Ensure backend/config/db.js exists and environment variables are correct.
- If you use Google sign-in, ensure GOOGLE_CLIENT_ID is configured in the frontend.