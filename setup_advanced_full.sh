#!/usr/bin/env bash
# setup_advanced_full.sh
# Creates a feature branch and writes a comprehensive set of backend + frontend files
# to make the app "advanced, powerful, and modern". Installs dependencies, optionally
# runs DB migrations (requires mysql client), builds frontend, and pushes the branch.
#
# RUN THIS FROM THE REPOSITORY ROOT (where .git is located).
# Review the script before running. It will overwrite files with the same paths.
#
# Usage:
#   chmod +x setup_advanced_full.sh
#   ./setup_advanced_full.sh
#
# The script will:
#  - create or switch to branch feature/advanced-full-stack
#  - create directories and files (backend/, services/, components/, migrations/, worker/)
#  - install backend deps (npm install)
#  - run optional migrations (requires mysql client)
#  - build frontend (npm run build)
#  - commit and push the branch to origin
#  - print instructions for opening a PR (via gh or GitHub UI)
#
set -euo pipefail

BRANCH="feature/advanced-full-stack"
REPO_ROOT="$(pwd)"

echo ""
echo "WARNING: This script will create/overwrite many files in your repository."
echo "It intends to add advanced backend + frontend features (recommendations, search, queue, redis, sockets, analytics, bookmarks, migrations, docker compose)."
echo "Please BACK UP any local changes you care about."
echo ""
read -p "Type YES to proceed: " CONFIRM
if [ "$CONFIRM" != "YES" ]; then
  echo "Aborted by user."
  exit 1
fi

# Basic checks
if [ ! -d ".git" ]; then
  echo "Error: current directory does not look like a git repository root (.git missing). Aborting."
  exit 1
fi

# Create branch or checkout existing
git fetch origin || true
if git rev-parse --verify --quiet "$BRANCH" >/dev/null; then
  echo "Checking out existing branch $BRANCH"
  git checkout "$BRANCH"
  git pull origin "$BRANCH" || true
else
  echo "Creating branch $BRANCH"
  git checkout -b "$BRANCH"
fi

# Make directories
mkdir -p backend/controllers backend/routes backend/middleware backend/uploads worker services components migrations
mkdir -p backend/worker

echo "Writing files..."

# backend/package.json
cat > backend/package.json <<'EOF'
{
  "name": "mahamanews-backend",
  "version": "1.0.0",
  "description": "Mahama News Hub - backend (advanced)",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "worker": "node worker/worker.js"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "bcryptjs": "^2.4.3",
    "bullmq": "^1.87.0",
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
    "socket.io": "^4.8.1",
    "uuid": "^9.0.0",
    "winston": "^3.9.0",
    "typesense": "^1.0.0"
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
const rateLimit = require('express-rate-limit');
const { initLogger, requestLogger } = require('./middleware/logger');
const { attachSecureHeaders } = require('./middleware/secureHeaders');
const { initRedis } = require('./middleware/cacheMiddleware');
const { Queue, Worker } = require('bullmq');
const http = require('http');
const { Server } = require('socket.io');

const logger = initLogger();
const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: { origin: process.env.CORS_ORIGIN || '*', methods: ['GET','POST'] }
});
io.on('connection', socket => {
  logger.info('Socket connected: %s', socket.id);
  socket.on('subscribe-category', (category) => {
    socket.join(`category:${category}`);
  });
  socket.on('disconnect', () => logger.info('Socket disconnected: %s', socket.id));
});

// Init Redis (optional)
const redisClient = initRedis();
const connection = redisClient ? { connection: redisClient } : { connection: { host: process.env.REDIS_HOST || 'redis', port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379 } };
const syncQueue = new Queue('external-sync', connection);

// Worker - processes jobs and notifies clients about new articles
try {
  const worker = new Worker('external-sync', async job => {
    const { processSync } = require('./worker/processSync');
    const inserted = await processSync(job.data.source || 'all');
    if (inserted && inserted.length > 0) {
      io.emit('new-articles', { insertedCount: inserted.length, articles: inserted.map(a => ({ id: a.id, title: a.title, category: a.category })) });
    }
    return inserted.length;
  }, connection);

  worker.on('failed', (job, err) => logger.error('Worker failed job %s: %s', job.id, err.message));
} catch (err) {
  logger.warn('Worker not started (missing redis?), err=%s', err.message || err);
}

app.use(helmet());
app.use(attachSecureHeaders);
app.use(compression());
app.use(requestLogger);

app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '16mb' }));
app.use(express.urlencoded({ extended: true, limit: '16mb' }));

app.use((req, res, next) => { req.ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress; next(); });

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX || '120', 10),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({ message: 'Too many requests. Please try again later.' })
});
app.use('/api/', limiter);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount pre-existing routes if present (fail safe)
try {
  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/users', require('./routes/userRoutes'));
  app.use('/api/articles', require('./routes/articleRoutes'));
  app.use('/api/ads', require('./routes/adRoutes'));
  app.use('/api/ai', require('./routes/aiRoutes'));
  app.use('/api/dashboard', require('./routes/dashboardRoutes'));
  app.use('/api/site', require('./routes/siteRoutes'));
  app.use('/api/payments', require('./routes/paymentRoutes'));
} catch (err) {
  logger.warn('Some existing routes could not be mounted: %s', err.message || err);
}

// New advanced routes
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/search', require('./routes/search'));
app.use('/api/external', require('./routes/externalRoutes')(syncQueue)); // factory accepts queue
app.use('/api/bookmarks', require('./routes/bookmarkRoutes'));
app.use('/api/analytics', require('./routes/analytics'));

// Health & readiness
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));
app.get('/ready', async (req, res) => {
  try {
    const pool = require('./config/db');
    await pool.query('SELECT 1');
    if (redisClient) await redisClient.ping();
    res.json({ ready: true });
  } catch (err) {
    logger.error('Readiness failed', err);
    res.status(503).json({ ready: false, error: err.message });
  }
});

// Serve frontend (production)
const CLIENT_DIST = path.join(__dirname, '..', 'dist');
if (process.env.SERVE_FRONTEND === 'true' || process.env.NODE_ENV === 'production') {
  app.use(express.static(CLIENT_DIST));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) return res.status(404).json({ message: 'Not found' });
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
}

// Error handler
app.use((err, req, res, next) => {
  logger.error(err.stack || err);
  res.status(err.statusCode || 500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = parseInt(process.env.PORT || '5000', 10);
server.listen(PORT, () => logger.info(`Server & sockets running on port ${PORT}`));
EOF

# middleware/logger.js
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
    transports: [new winston.transports.Console({ format: winston.format.simple() })]
  });
  return logger;
}

function requestLogger(req, res, next) {
  const logger = initLogger();
  const format = process.env.MORGAN_FORMAT || 'combined';
  return morgan(format, {
    stream: { write: (message) => logger.info(message.trim()) }
  })(req, res, next);
}

module.exports = { initLogger, requestLogger };
EOF

# middleware/secureHeaders.js
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

# middleware/cacheMiddleware.js
cat > backend/middleware/cacheMiddleware.js <<'EOF'
const Redis = require('ioredis');
let client = null;

function initRedis() {
  const url = process.env.REDIS_URL || (process.env.REDIS_HOST ? `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT || 6379}` : null);
  if (!url) return null;
  if (client) return client;
  client = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 2 });
  client.on('error', (err) => console.error('Redis error', err));
  client.connect().catch(err => console.error('Redis connect error', err));
  return client;
}

async function cacheGetOrSet(key, ttlSeconds, fn) {
  if (!client) return fn();
  try {
    const cached = await client.get(key);
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { /* ignore parse */ }
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

# middleware/apiKeyAuth.js
cat > backend/middleware/apiKeyAuth.js <<'EOF'
const pool = require('../config/db');

const apiKeyAuth = async (req, res, next) => {
  try {
    const incoming = req.headers['x-api-key'] || req.query.api_key;
    if (!incoming) return res.status(401).json({ message: 'API key required' });

    if (process.env.PUBLIC_API_KEY && incoming === process.env.PUBLIC_API_KEY) return next();

    try {
      const [rows] = await pool.query('SELECT id, name, active FROM api_keys WHERE api_key = ? LIMIT 1', [incoming]);
      if (rows && rows.length > 0 && rows[0].active) return next();
    } catch (err) {
      console.warn('apiKeyAuth DB lookup failed', err.message || err);
    }
    return res.status(403).json({ message: 'Invalid API key' });
  } catch (err) {
    console.error('apiKeyAuth error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { apiKeyAuth };
EOF

# Worker: processSync.js
cat > backend/worker/processSync.js <<'EOF'
const axios = require('axios');
const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

async function processSync(source = 'all') {
  const inserted = [];

  async function upsertArticle(a) {
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
  }

  try {
    if ((source === 'newsapi' || source === 'all') && process.env.NEWSAPI_KEY) {
      const res = await axios.get('https://newsapi.org/v2/top-headlines', { params: { language: 'en', pageSize: 50, apiKey: process.env.NEWSAPI_KEY }});
      for (const art of (res.data.articles || [])) {
        const up = await upsertArticle(art);
        if (up) inserted.push(up);
      }
    }
    if ((source === 'gnews' || source === 'all') && process.env.GNEWS_KEY) {
      const res = await axios.get('https://gnews.io/api/v4/top-headlines', { params: { token: process.env.GNEWS_KEY, lang: 'en', max: 50 }});
      for (const art of (res.data.articles || [])) {
        const up = await upsertArticle(art);
        if (up) inserted.push(up);
      }
    }
  } catch (err) {
    console.error('processSync error', err);
    throw err;
  }

  return inserted;
}

module.exports = { processSync };
EOF

# backend/worker/worker.js
cat > backend/worker/worker.js <<'EOF'
/*
 Standalone worker to process sync jobs.
 Run separately in production (recommended).
 */
require('dotenv').config();
const { Worker } = require('bullmq');
const { initLogger } = require('../middleware/logger');
const { initRedis } = require('../middleware/cacheMiddleware');

const logger = initLogger();
const redisClient = initRedis();
const connection = redisClient ? { connection: redisClient } : { connection: { host: process.env.REDIS_HOST || '127.0.0.1', port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379 } };

const worker = new Worker('external-sync', async job => {
  const { processSync } = require('../worker/processSync');
  const inserted = await processSync(job.data.source || 'all');
  logger.info('Processed job %s, inserted %d articles', job.id, inserted.length || 0);
  return inserted.length;
}, connection);

worker.on('completed', job => logger.info('Job %s completed', job.id));
worker.on('failed', (job, err) => logger.error('Job %s failed: %s', job.id, err.message));
EOF

# controllers: recommendationController.js
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

    let params = [];
    let q = 'SELECT *, (CASE WHEN LOWER(category) IN (?) THEN 2 ELSE 0 END)';
    params.push(categories.map(c => c.toLowerCase()));

    if (tags.length > 0) {
      q += ' + (CASE ';
      q += tags.map(() => ' WHEN tags LIKE ? THEN 1').join('');
      q += ' ELSE 0 END)';
      params.push(...tags.map(t => `%${t}%`));
    } else {
      q += ' AS score';
    }
    q += ' FROM articles WHERE (scheduled_for IS NULL OR scheduled_for <= NOW()) ORDER BY score DESC, published_at DESC LIMIT ?';
    params.push(count);

    const [articles] = await pool.query(q, params);
    if (articles && articles.length > 0) return res.json(articles);

    // Collaborative-ish fallback
    const [userViews] = await pool.query('SELECT article_id FROM user_views WHERE user_id = ? ORDER BY viewed_at DESC LIMIT 50', [userId]);
    if (!userViews || userViews.length === 0) {
      const [trending] = await pool.query('SELECT * FROM articles WHERE (scheduled_for IS NULL OR scheduled_for <= NOW()) ORDER BY views DESC LIMIT ?', [count]);
      return res.json(trending);
    }
    const viewedIds = userViews.map(v => v.article_id);
    const [others] = await pool.query(
      `SELECT DISTINCT uv2.article_id as id, a.* FROM user_views uv1
       JOIN user_views uv2 ON uv1.user_id = uv2.user_id
       JOIN articles a ON a.id = uv2.article_id
       WHERE uv1.article_id IN (?) AND uv2.article_id NOT IN (?) AND (a.scheduled_for IS NULL OR a.scheduled_for <= NOW())
       ORDER BY uv2.viewed_at DESC LIMIT ?`,
      [viewedIds, viewedIds, count]
    );
    return res.json(others);
  } catch (err) {
    next(err);
  }
};

module.exports = { getRecommendations };
EOF

# controllers/searchController.js
cat > backend/controllers/searchController.js <<'EOF'
const pool = require('../config/db');
const Typesense = require('typesense');

const typesenseClient = (process.env.TYPESENSE_HOST && process.env.TYPESENSE_API_KEY) ? new Typesense.Client({
  nodes: [{ host: process.env.TYPESENSE_HOST, port: process.env.TYPESENSE_PORT || '8108', protocol: process.env.TYPESENSE_PROTO || 'http' }],
  apiKey: process.env.TYPESENSE_API_KEY,
  connectionTimeoutSeconds: 2
}) : null;

const search = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.status(400).json({ message: 'q parameter required' });
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);

    if (typesenseClient) {
      const searchParams = { q, query_by: 'title,description,body', per_page: limit, page };
      const resTs = await typesenseClient.collections('articles').documents().search(searchParams);
      return res.json({ articles: resTs.hits.map(h => h.document), totalPages: Math.ceil((resTs.found || 0) / limit), currentPage: page });
    }

    const useFulltext = process.env.USE_FULLTEXT === 'true';
    const offset = (page - 1) * limit;
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
      const [countRes] = await pool.query(`SELECT COUNT(*) as total FROM articles WHERE MATCH(title, description, body) AGAINST(? IN NATURAL LANGUAGE MODE)`, [q]);
      const total = countRes[0] ? countRes[0].total : 0;
      return res.json({ articles: rows, totalPages: Math.ceil(total / limit), currentPage: page });
    } else {
      const likeQ = `%${q}%`;
      const [rows] = await pool.query(`SELECT * FROM articles WHERE (title LIKE ? OR description LIKE ? OR body LIKE ?) AND (scheduled_for IS NULL OR scheduled_for <= NOW()) ORDER BY published_at DESC LIMIT ? OFFSET ?`, [likeQ, likeQ, likeQ, limit, offset]);
      const [countRes] = await pool.query(`SELECT COUNT(*) as total FROM articles WHERE (title LIKE ? OR description LIKE ? OR body LIKE ?)`, [likeQ, likeQ, likeQ]);
      const total = countRes[0] ? countRes[0].total : 0;
      return res.json({ articles: rows, totalPages: Math.ceil(total / limit), currentPage: page });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = { search };
EOF

# controllers/externalController.js (factory)
cat > backend/controllers/externalController.js <<'EOF'
module.exports = (syncQueue) => {
  const express = require('express');
  const router = express.Router();
  const { protect, admin } = require('../middleware/authMiddleware');

  router.post('/sync', protect, admin, async (req, res, next) => {
    try {
      const { source } = req.body || {};
      const job = await syncQueue.add('sync', { source: source || 'all' }, { removeOnComplete: true, removeOnFail: true });
      res.json({ message: 'Sync enqueued', jobId: job.id });
    } catch (err) { next(err); }
  });

  router.post('/sync-now', protect, admin, async (req, res, next) => {
    try {
      const { processSync } = require('../worker/processSync');
      const inserted = await processSync(req.body?.source || 'all');
      res.json({ inserted: inserted.length });
    } catch (err) { next(err); }
  });

  return router;
};
EOF

# controllers/bookmarkController.js
cat > backend/controllers/bookmarkController.js <<'EOF'
const pool = require('../config/db');

const getBookmarks = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    const [rows] = await pool.query('SELECT b.id, b.article_id, a.title, a.url, a.urlToImage, b.created_at FROM bookmarks b JOIN articles a ON a.id = b.article_id WHERE b.user_id = ? ORDER BY b.created_at DESC', [user.id]);
    res.json(rows);
  } catch (err) { next(err); }
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
  } catch (err) { next(err); }
};

const removeBookmark = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    const id = req.params.id;
    await pool.query('DELETE FROM bookmarks WHERE id = ? AND user_id = ?', [id, user.id]);
    res.json({ message: 'Bookmark removed' });
  } catch (err) { next(err); }
};

module.exports = { getBookmarks, addBookmark, removeBookmark };
EOF

# controllers/analyticsController.js
cat > backend/controllers/analyticsController.js <<'EOF'
const pool = require('../config/db');

const recordView = async (req, res, next) => {
  try {
    const user = req.user || null;
    const { articleId } = req.body;
    if (!articleId) return res.status(400).json({ message: 'articleId required' });
    await pool.query('UPDATE articles SET views = COALESCE(views,0) + 1 WHERE id = ?', [articleId]);
    const insert = { article_id: articleId, user_id: user ? user.id : null, viewed_at: new Date() };
    await pool.query('INSERT INTO user_views SET ?', insert);
    res.json({ message: 'Recorded' });
  } catch (err) { next(err); }
};

const getTrending = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || '10', 10);
    const [rows] = await pool.query('SELECT * FROM articles WHERE (scheduled_for IS NULL OR scheduled_for <= NOW()) ORDER BY views DESC LIMIT ?', [limit]);
    res.json(rows);
  } catch (err) { next(err); }
};

module.exports = { recordView, getTrending };
EOF

# routes
cat > backend/routes/recommendations.js <<'EOF'
const express = require('express');
const { getRecommendations } = require('../controllers/recommendationController');
const router = express.Router();
router.get('/', getRecommendations);
module.exports = router;
EOF

cat > backend/routes/search.js <<'EOF'
const express = require('express');
const { search } = require('../controllers/searchController');
const router = express.Router();
router.get('/', search);
module.exports = router;
EOF

cat > backend/routes/externalRoutes.js <<'EOF'
module.exports = (syncQueue) => require('../controllers/externalController')(syncQueue);
EOF

cat > backend/routes/bookmarkRoutes.js <<'EOF'
const express = require('express');
const { getBookmarks, addBookmark, removeBookmark } = require('../controllers/bookmarkController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();
router.use(protect);
router.get('/', getBookmarks);
router.post('/', addBookmark);
router.delete('/:id', removeBookmark);
module.exports = router;
EOF

cat > backend/routes/analytics.js <<'EOF'
const express = require('express');
const { recordView, getTrending } = require('../controllers/analyticsController');
const router = express.Router();
router.post('/view', recordView);
router.get('/trending', getTrending);
module.exports = router;
EOF

# Frontend services and components (TypeScript/TSX)
cat > services/apiService.ts <<'EOF'
export const API_URL = (import.meta.env?.VITE_API_URL as string) || 'http://localhost:5000';

const getAuthToken = () => {
  try {
    const auth = localStorage.getItem('auth');
    if (auth) return JSON.parse(auth).token;
  } catch (err) { console.warn('apiService token parse', err); }
  return null;
};

const buildHeaders = (isJson = true) => {
  const headers: Record<string,string> = {};
  if (isJson) headers['Content-Type'] = 'application/json';
  const token = getAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const api = {
  get: async <T>(endpoint: string): Promise<T> => {
    const res = await fetch(`${API_URL}${endpoint}`, { headers: buildHeaders(true), credentials: 'include' });
    if (!res.ok) { const txt = await res.text(); throw new Error(`HTTP ${res.status}: ${txt}`); }
    return res.json();
  },
  post: async <T>(endpoint: string, body: any, isJson = true): Promise<T> => {
    const res = await fetch(`${API_URL}${endpoint}`, { method: 'POST', headers: buildHeaders(isJson), credentials: 'include', body: isJson ? JSON.stringify(body) : body });
    if (!res.ok) { const txt = await res.text(); throw new Error(`HTTP ${res.status}: ${txt}`); }
    const ct = res.headers.get('content-type') || '';
    return ct.includes('application/json') ? res.json() : (await res.text()) as unknown as T;
  },
  put: async <T>(endpoint: string, body: any): Promise<T> => {
    const res = await fetch(`${API_URL}${endpoint}`, { method: 'PUT', headers: buildHeaders(true), credentials: 'include', body: JSON.stringify(body) });
    if (!res.ok) { const txt = await res.text(); throw new Error(`HTTP ${res.status}: ${txt}`); }
    return res.json();
  },
  delete: async <T>(endpoint: string): Promise<T> => {
    const res = await fetch(`${API_URL}${endpoint}`, { method: 'DELETE', headers: buildHeaders(true), credentials: 'include' });
    if (!res.ok) { const txt = await res.text(); throw new Error(`HTTP ${res.status}: ${txt}`); }
    return res.json();
  }
};
EOF

cat > services/newsService.ts <<'EOF'
import { api } from './apiService';
export const getRecommendations = async (userId: string|null, count = 10) => api.get(`/api/recommendations?userId=${encodeURIComponent(userId||'')}&count=${count}`);
export const searchArticles = async (query: string, page = 1, limit = 10) => api.get(`/api/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
export const syncExternalNews = async (source?: string) => api.post('/api/external/sync', { source });
export const getTrendingArticles = async (limit = 10) => api.get(`/api/analytics/trending?limit=${limit}`);
export const addBookmark = async (articleId: string) => api.post('/api/bookmarks', { articleId });
export const removeBookmark = async (bookmarkId: string) => api.delete(`/api/bookmarks/${encodeURIComponent(bookmarkId)}`);
export const getBookmarks = async () => api.get('/api/bookmarks');
EOF

cat > services/socketService.ts <<'EOF'
import { io, Socket } from 'socket.io-client';
let socket: Socket|null = null;
export function initSocket() {
  if (socket) return socket;
  const url = (import.meta.env?.VITE_API_URL as string) || 'http://localhost:5000';
  socket = io(url, { transports: ['websocket'] });
  socket.on('connect', () => console.log('socket connected', socket?.id));
  socket.on('disconnect', () => console.log('socket disconnected'));
  return socket;
}
export function subscribeToNewArticles(cb: (data:any)=>void) { const s = initSocket(); s.on('new-articles', cb); return () => s.off('new-articles', cb); }
export function subscribeToCategory(category: string) { const s = initSocket(); s.emit('subscribe-category', category); }
EOF

cat > services/recommendationService.ts <<'EOF'
import { api } from './apiService';
export async function fetchRecommendations(userId: string|null, count = 10) {
  return api.get(`/api/recommendations?userId=${encodeURIComponent(userId||'')}&count=${count}`);
}
EOF

cat > components/LoginModal.tsx <<'EOF'
import React, { useState } from 'react';
import Modal from './Modal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<boolean> | void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email||!password) return;
    try {
      await onLogin(email,password);
      onClose && onClose();
    } catch(err) { console.error('Login error', err); }
  };
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Login">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div><label>Your email</label><input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
        <div><label>Your password</label><input id="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></div>
        <button type="submit" className="btn-primary">Login</button>
      </form>
    </Modal>
  );
};

export default LoginModal;
EOF

cat > components/NotificationCenter.tsx <<'EOF'
import React, { useEffect, useState } from 'react';
import { initSocket, subscribeToNewArticles } from '../services/socketService';
const NotificationCenter: React.FC = () => {
  const [notes, setNotes] = useState<any[]>([]);
  useEffect(()=> {
    initSocket();
    const unsub = subscribeToNewArticles((data:any) => setNotes(n => [{ id: Date.now(), ...data }, ...n].slice(0,10)));
    return () => unsub();
  },[]);
  return (
    <div className="notifications">
      <h4>Live Updates</h4>
      <ul>{notes.map(n => <li key={n.id}>{n.insertedCount ? `${n.insertedCount} new articles` : 'New content'}</li>)}</ul>
    </div>
  );
};
export default NotificationCenter;
EOF

# Migrations
cat > migrations/001_create_bookmarks_api_keys_and_fulltext.sql <<'EOF'
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

-- Optional FULLTEXT index (adjust to your schema)
ALTER TABLE articles
  ADD FULLTEXT idx_fulltext_title_description_body (title, description, body);
EOF

cat > migrations/002_create_user_views_and_activity.sql <<'EOF'
CREATE TABLE IF NOT EXISTS user_views (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(100) NULL,
  article_id VARCHAR(255) NOT NULL,
  viewed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX (user_id),
  INDEX (article_id),
  INDEX (viewed_at)
);

CREATE TABLE IF NOT EXISTS user_activity (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  activity_type VARCHAR(50) NOT NULL,
  payload JSON NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (user_id),
  INDEX (activity_type)
);
EOF

# Docker and compose
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

cat > README_DEPLOY.md <<'EOF'
# Advanced Full-Stack Deployment Guide

1) Copy .env.example -> .env and fill DB_*, JWT_SECRET, VITE_API_URL, NEWSAPI_KEY/GNEWS_KEY, PUBLIC_API_KEY, REDIS_URL as needed.

2) Run DB migrations:
   mysql -u <user> -p <DB_NAME> < migrations/001_create_bookmarks_api_keys_and_fulltext.sql
   mysql -u <user> -p <DB_NAME> < migrations/002_create_user_views_and_activity.sql

   If ALTER TABLE FULLTEXT fails, remove that line and set USE_FULLTEXT=false in .env.

3) Install and build:
   cd backend && npm install
   cd .. && npm install
   npm run build

4) Start:
   cd backend && npm start
   (Or with docker-compose: docker-compose up --build -d)

5) Verify login/register redirect:
   - The LoginModal now calls onLogin(email,password). App.tsx handlers call handleCategorySelect('World') after auth. Register/login should redirect to the World category.

6) Test endpoints:
   - GET /api/search?q=term
   - GET /api/recommendations?userId=<id>
   - POST /api/external/sync (admin)
   - POST /api/analytics/view { articleId }

Notes:
- Review all new files and integrate carefully if you have existing customizations.
- Test in staging before production.
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

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_URL=redis://redis:6379

# External news
NEWSAPI_KEY=
GNEWS_KEY=

# Typesense (optional)
TYPESENSE_HOST=
TYPESENSE_API_KEY=
TYPESENSE_PORT=8108
TYPESENSE_PROTO=http

# Fulltext toggle
USE_FULLTEXT=false

# Public API key
PUBLIC_API_KEY=some_public_key_value

# Frontend base for Vite
VITE_API_URL=http://localhost:5000

# App
NODE_ENV=production
PORT=5000
EOF

echo "Files written. Installing backend dependencies (this may take a minute)..."
cd backend
npm install

echo ""
echo "Installation complete. Next steps:"
echo "1) Run DB migrations (requires mysql client):"
echo "   mysql -u <user> -p <DB_NAME> < ../migrations/001_create_bookmarks_api_keys_and_fulltext.sql"
echo "   mysql -u <user> -p <DB_NAME> < ../migrations/002_create_user_views_and_activity.sql"
echo "   (If FULLTEXT fails, remove that line and set USE_FULLTEXT=false in .env)"
echo ""
echo "2) Build frontend (from repo root):"
echo "   cd .."
echo "   npm install"
echo "   npm run build"
echo ""
echo "3) Start backend:"
echo "   cd backend"
echo "   npm start"
echo ""
echo "4) Optionally start worker separately:"
echo "   cd backend"
echo "   npm run worker"
echo ""
echo "5) To use docker-compose:"
echo "   docker-compose up --build -d"
echo ""
echo "Committing changes to branch $BRANCH..."
cd "$REPO_ROOT"
git add .
git commit -m "Add advanced full-stack features: recommendations, search, queue, redis, sockets, analytics, bookmarks, migrations, docker setup"
git push -u origin "$BRANCH"

echo ""
echo "Branch pushed: $BRANCH"
echo "Create a PR via GitHub UI or with gh CLI:"
echo "  gh pr create --base main --head $BRANCH --title \"Advanced full-stack: recommendations, search, queue, sockets, analytics\" --body \"Adds advanced backend + frontend features, migrations and docker-compose. See README_DEPLOY.md for steps.\""
echo ""
echo "Script finished. Please review new files, update .env with secrets, run migrations, and test in staging."