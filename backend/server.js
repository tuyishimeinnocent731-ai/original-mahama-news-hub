require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimiter = require('./middleware/rateLimiter');
const { handleWebhook } = require('./controllers/paymentController');

const app = express();

// Stripe webhook needs raw body, so it must be placed before express.json()
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Middleware
app.use(cors());
app.use(express.json({ limit: '16mb' })); // Increased limit for potential image uploads
app.use(express.urlencoded({ extended: true, limit: '16mb' }));

// Simple IP address middleware (for rate limiting and logging)
app.use((req, res, next) => {
    req.ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    next();
});

// Apply Rate Limiter to all API routes
app.use('/api/', rateLimiter);

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/articles', require('./routes/articleRoutes'));
app.use('/api/ads', require('./routes/adRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/site', require('./routes/siteRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

// Public API routes (with API key auth)
app.use('/api/v1', require('./routes/publicApiRoutes'));


// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({ message });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
