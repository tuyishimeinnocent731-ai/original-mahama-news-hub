const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 200; // Increased limit

const rateLimiter = (req, res, next) => {
    const ip = req.ipAddress;
    const now = Date.now();
    
    if (!rateLimitStore.has(ip)) {
        rateLimitStore.set(ip, { count: 1, startTime: now });
        return next();
    }

    const userData = rateLimitStore.get(ip);
    const elapsedTime = now - userData.startTime;

    if (elapsedTime > RATE_LIMIT_WINDOW_MS) {
        rateLimitStore.set(ip, { count: 1, startTime: now });
        return next();
    }

    if (userData.count < MAX_REQUESTS) {
        userData.count++;
        rateLimitStore.set(ip, userData);
        return next();
    } else {
        return res.status(429).json({ message: 'Too many requests, please try again later.' });
    }
};

// Clean up old entries periodically to prevent memory leaks
setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of rateLimitStore.entries()) {
        if (now - data.startTime > RATE_LIMIT_WINDOW_MS) {
            rateLimitStore.delete(ip);
        }
    }
}, RATE_LIMIT_WINDOW_MS);


module.exports = rateLimiter;
