#!/usr/bin/env bash
set -euo pipefail

BRANCH="feature/advanced-apis-integration"
echo "This script will create the backend/frontend/deploy files needed for full-stack deployment and push them to branch: $BRANCH"
read -p "Proceed? (type YES to continue): " CONFIRM
if [ "$CONFIRM" != "YES" ]; then
  echo "Aborted by user."
  exit 1
fi

# Ensure we're in repo root (basic check)
if [ ! -d ".git" ]; then
  echo "Error: run this script from the repository root where .git exists."
  exit 1
fi

# Create branch (if exists, check it out)
git fetch origin
if git rev-parse --verify --quiet "$BRANCH" >/dev/null; then
  git checkout "$BRANCH"
  git pull origin "$BRANCH"
else
  git checkout -b "$BRANCH"
fi

# Create directories
mkdir -p backend/controllers backend/routes backend/middleware backend/uploads migrations services components

echo "Writing files..."

# backend/server.js
cat > backend/server.js <<'EOF'
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimiter = require('./middleware/rateLimiter');

const app = express();

// Stripe webhook (optional). Keep raw body for webhook if used.
if (process.env.STRIPE_WEBHOOK_SECRET) {
  try {
    const { handleWebhook } = require('./controllers/paymentController');
    app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), handleWebhook);
  } catch (err) {
    console.warn('Payment webhook controller missing or not configured');
  }
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '16mb' }));
app.use(express.urlencoded({ extended: true, limit: '16mb' }));

// Attach IP for logging/rate limit
app.use((req, res, next) => {
  req.ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  next();
});

// Optional rate limiter
try {
  app.use('/api/', rateLimiter);
} catch (err) {
  console.warn('Rate limiter not applied:', err.message || err);
}

// Serve uploaded assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Existing app routes (keep your current ones)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/articles', require('./routes/articleRoutes'));
app.use('/api/ads', require('./routes/adRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/site', require('./routes/siteRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

// New powerful APIs (add these files)
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/search', require('./routes/search'));
app.use('/api/external', require('./routes/externalRoutes'));
app.use('/api/bookmarks', require('./routes/bookmarkRoutes'));

// Public API (api key)
app.use('/api/v1', require('./routes/publicApiRoutes'));

// Serve frontend build (expects top-level /dist from Vite build)
const CLIENT_DIST = path.join(__dirname, '..', 'dist');
app.use(express.static(CLIENT_DIST));

// Fallback for SPA - send index.html for unknown GET routes not starting with /api
app.get('*', (req, res) => {
  const indexHtml = path.join(CLIENT_DIST, 'index.html');
  res.sendFile(indexHtml, (err) => {
    if (err) res.status(500).send('Error loading application');
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on :${PORT}`));
EOF

# backend/middleware/apiKeyAuth.js
cat > backend/middleware/apiKeyAuth.js <<'EOF'
// Simple API key middleware - checks env PUBLIC_API_KEY or api_keys table
const pool = require('../config/db');

const apiKeyAuth = async (req, res, next) => {
  try {
    const incoming = req.headers['x-api-key'] || req.query.api_key;
    if (!incoming) return res.status(401).json({ message: 'API key required' });

    if (process.env.PUBLIC_API_KEY && incoming === process.env.PUBLIC_API_KEY) {
      return next();
    }

    // DB lookup (if table exists)
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

/**
 * GET /api/recommendations?userId=...&count=...
 * If userId not provided, return trending by views.
 * If user has preferred_categories/preferred_tags, prefer those.
 */
const getRecommendations = async (req, res, next) => {
  try {
    const userId = req.query.userId;
    const count = parseInt(req.query.count || '10', 10);

    if (!userId) {
      const [rows] = await pool.query(
        'SELECT * FROM articles WHERE (scheduled_for IS NULL OR scheduled_for <= NOW()) ORDER BY views DESC LIMIT ?',
        [count]
      );
      return res.json(rows);
    }

    const [rows] = await pool.query('SELECT preferred_categories, preferred_tags FROM user_settings WHERE user_id = ? LIMIT 1', [userId]);
    const settings = rows && rows.length > 0 ? rows[0] : null;
    const categories = settings && settings.preferred_categories ? JSON.parse(settings.preferred_categories) : [];
    const tags = settings && settings.preferred_tags ? JSON.parse(settings.preferred_tags) : [];

    // Simple hybrid scoring
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

/**
 * GET /api/search?q=...&page=1&limit=10
 * Set USE_FULLTEXT=true in .env if you created FULLTEXT index on articles(title, description, body)
 */
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

/**
 * POST /api/external/sync
 * Body: { source: 'newsapi' | 'gnews' | 'all' }
 * Requires admin. Performs a best-effort insert for new articles.
 */
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

/**
 * GET /api/bookmarks
 * POST /api/bookmarks { articleId }
 * DELETE /api/bookmarks/:id
 * Requires protect middleware to populate req.user
 */
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

// public: can accept userId query param for personalized results
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

// Only admins should trigger full syncs by default
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
mkdir -p services
cat > services/apiService.ts <<'EOF'
// frontend: services/apiService.ts - improved error handling and env-based base URL
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
// frontend: services/newsService.ts - appended powerful APIs
import { api } from './apiService';
import { Article } from '../types';

// Keep existing functions as-is; append these
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

// Bookmarks
export const addBookmark = async (articleId: string) => api.post('/api/bookmarks', { articleId });
export const removeBookmark = async (bookmarkId: string) => api.delete(`/api/bookmarks/${encodeURIComponent(bookmarkId)}`);
export const getBookmarks = async () => api.get('/api/bookmarks');
EOF

# components/LoginModal.tsx
mkdir -p components
cat > components/LoginModal.tsx <<'EOF'
import React, { useState } from 'react';
import Modal from './Modal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Fixed signature: expects email & password so App's onLogin handler (which redirects to World) will be called
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
    } catch (err) {
      // onLogin handles toasts/errors; swallow here
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
mkdir -p migrations
cat > migrations/001_create_bookmarks_api_keys_and_fulltext.sql <<'EOF'
-- Run this against your MySQL database
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

-- Optional: add FULLTEXT index on articles for better search (requires ENGINE=InnoDB or MyISAM)
-- Adjust `articles` table name/columns if different in your schema.
ALTER TABLE articles
  ADD FULLTEXT IF NOT EXISTS idx_fulltext_title_description_body (title, description, body);
EOF

# backend/Dockerfile
cat > backend/Dockerfile <<'EOF'
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY backend/package*.json backend/
RUN npm ci --prefix backend --production

# Copy backend source
COPY backend/ backend/

# Create uploads directory
RUN mkdir -p /app/uploads

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000
CMD ["node", "backend/server.js"]
EOF

# top-level Dockerfile
cat > Dockerfile <<'EOF'
# Top-level Dockerfile to build and serve the Vite build statically (used by docker-compose frontend service)
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:stable-alpine AS runtime
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy a basic nginx config if you need custom routing; default is fine for SPA
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

# docker-compose.yml
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

  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    depends_on:
      - db
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

  adminer:
    image: adminer
    restart: always
    ports:
      - 8080:8080

volumes:
  db-data:
EOF

# README_DEPLOY.md
cat > README_DEPLOY.md <<'EOF'
# Deployment checklist (build + deploy)

This repository contains a Vite React frontend and a Node/Express backend. Follow these steps to deploy locally or to a server.

1) Environment
- Copy .env.example -> .env and set values (DB_*, JWT_SECRET, VITE_API_URL, etc.)
- Ensure the DB is accessible and run migrations.

2) Database
- Start MySQL
- Run migrations:
    mysql -u root -p ${DB_NAME} < migrations/001_create_bookmarks_api_keys_and_fulltext.sql

3) Build frontend
- From repo root:
    npm install
    npm run build
  This generates /dist.

4) Backend
- Install backend dependencies:
    cd backend && npm install
- Ensure .env variables set
- Start backend:
    node backend/server.js
  (Use pm2 or systemd in production.)

5) Docker (optional)
- docker-compose up --build -d
- The stack will start MySQL, backend, frontend (nginx serving dist), and Adminer.

6) Post-deploy
- Create API keys via insert into api_keys table or set PUBLIC_API_KEY in .env
- Run external sync (admin only): POST /api/external/sync with an admin token

7) Notes
- For full-text search: ensure the FULLTEXT index exists and set USE_FULLTEXT=true in your .env.
- The LoginModal is fixed to call App.tsx login signature; App.tsx will redirect to the World category on successful login/register.
- Security: Use HTTPS + reverse proxy (nginx) in production. Keep JWT_SECRET secret.
EOF

# .env.example
cat > .env.example <<'EOF'
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=mahama_news

# JWT
JWT_SECRET=change_this_secret

# App
NODE_ENV=production
PORT=5000

# External news keys (optional)
NEWSAPI_KEY=your_newsapi_key
GNEWS_KEY=your_gnews_key

# Use fulltext search (set to 'true' if you've applied the FULLTEXT index)
USE_FULLTEXT=false

# Public API key fallback for /api/v1 endpoints
PUBLIC_API_KEY=some_public_key_value

# Frontend Vite
VITE_API_URL=http://localhost:5000
EOF

echo "Files written."

echo "Staging files..."
git add backend/server.js backend/middleware/apiKeyAuth.js backend/controllers/* backend/routes/* services/apiService.ts services/newsService.ts components/LoginModal.tsx migrations/001_create_bookmarks_api_keys_and_fulltext.sql backend/Dockerfile Dockerfile docker-compose.yml README_DEPLOY.md .env.example || true

git commit -m "Add advanced APIs, frontend integration, migrations, Docker and deploy instructions" || echo "Nothing to commit (files may have been unchanged)."

echo "Pushing branch $BRANCH to origin..."
git push -u origin "$BRANCH"

echo ""
echo "Pushed to origin/$BRANCH."
echo ""
echo "Next steps:"
echo "1) Run migrations against your MySQL database:"
echo "   mysql -u <user> -p ${DB_NAME} < migrations/001_create_bookmarks_api_keys_and_fulltext.sql"
echo "2) Build frontend (from repo root):"
echo "   npm install"
echo "   npm run build"
echo "3) Start backend:"
echo "   cd backend && npm install && node server.js"
echo ""
echo "To create a PR using the GitHub CLI (if installed and authenticated):"
echo "  gh pr create --base main --head $BRANCH --title \"Advanced APIs + Deploy integration\" --body \"Adds recommendations, search, external sync, bookmarks, frontend integration, migrations and Docker Compose. Run migrations/001_create_bookmarks_api_keys_and_fulltext.sql before deploying.\""
echo ""
echo "If you want me to open the PR for you and/or merge it, I will need the repository permission to do so. Otherwise, open the PR using the command above or the GitHub web UI."
echo "Done."

exit 0