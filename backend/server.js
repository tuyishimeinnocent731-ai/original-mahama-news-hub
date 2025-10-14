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
