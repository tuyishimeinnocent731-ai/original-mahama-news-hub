require('dotenv').config();

// --- Environment Variable Validation ---
const requiredEnvVars = [
    'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME',
    'JWT_SECRET', 'API_KEY', 
    'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'STRIPE_PUBLISHABLE_KEY',
    'STRIPE_STANDARD_PRICE_ID', 'STRIPE_PREMIUM_PRICE_ID', 'STRIPE_PRO_PRICE_ID',
    'CLIENT_URL'
];
const missingVars = requiredEnvVars.filter(varName => {
    const value = process.env[varName];
    return !value || value.trim() === '';
});
if (missingVars.length > 0) {
    console.error(`FATAL ERROR: Missing required environment variables: ${missingVars.join(', ')}`);
    console.error('Please create a .env file based on .env.example and fill in the values.');
    process.exit(1); // Exit with a failure code
}
// --- End Validation ---

const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const articleRoutes = require('./routes/articleRoutes');
const adRoutes = require('./routes/adRoutes');
const siteRoutes = require('./routes/siteRoutes');
const aiRoutes = require('./routes/aiRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const paymentController = require('./controllers/paymentController');

const app = express();

// Stripe webhook needs raw body
app.post('/api/payments/webhook', express.raw({type: 'application/json'}), paymentController.handleWebhook);


// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add IP address to request object
app.use((req, res, next) => {
    req.ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    next();
});

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/resumes', express.static(path.join(__dirname, 'uploads/resumes')));


// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/site', siteRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/payments', paymentRoutes);


// Root endpoint
app.get('/', (req, res) => {
    res.send('Mahama News Hub API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});