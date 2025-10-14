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
