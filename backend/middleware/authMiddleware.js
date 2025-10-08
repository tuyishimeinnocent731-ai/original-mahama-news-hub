const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            const [rows] = await pool.query('SELECT id, name, email, role, subscription FROM users WHERE id = ?', [decoded.id]);
            
            if (rows.length > 0) {
                req.user = rows[0];
                next();
            } else {
                res.status(401).json({ message: 'Not authorized, user not found' });
            }
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

const subAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'sub-admin')) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin or sub-admin' });
    }
};

const proUser = (req, res, next) => {
     if (req.user && (req.user.role === 'admin' || req.user.subscription === 'pro')) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized, pro subscription required' });
    }
}


module.exports = { protect, admin, subAdmin, proUser };
