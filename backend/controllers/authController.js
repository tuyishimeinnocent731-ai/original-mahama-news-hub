const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const { formatUserFromDb } = require('../utils/userFormatter');
const { sendPasswordResetEmail } = require('../utils/mailService');


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const registerUser = async (req, res, next) => {
    const { name, email, password } = req.body;
    const connection = await pool.getConnection();

    try {
        const [userExists] = await connection.query('SELECT email FROM users WHERE email = ?', [email]);
        if (userExists.length > 0) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const userId = `user-${uuidv4()}`;

        await connection.beginTransaction();
        
        await connection.query('INSERT INTO users (id, name, email, password, avatar) VALUES (?, ?, ?, ?, ?)', [userId, name, email, hashedPassword, `https://i.pravatar.cc/150?u=${userId}`]);
        await connection.query('INSERT INTO user_settings (user_id) VALUES (?)', [userId]);

        await connection.commit();

        const [userRows] = await connection.query(formatUserFromDb.userQuery, [userId]);
        
        if (userRows.length > 0) {
            const user = formatUserFromDb(userRows[0]);
            res.status(201).json({
                token: generateToken(user.id),
                user: user,
            });
        } else {
            throw new Error('User registration failed');
        }
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};


const loginUser = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const [userRows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

        if (userRows.length > 0) {
            const user = userRows[0];
            const passwordMatch = await bcrypt.compare(password, user.password);
            
            if(passwordMatch) {
                const [fullUserRows] = await pool.query(formatUserFromDb.userQuery, [user.id]);
                const fullUser = formatUserFromDb(fullUserRows[0]);
                
                res.json({
                    token: generateToken(fullUser.id),
                    user: fullUser,
                });
            } else {
                res.status(401).json({ message: 'Invalid credentials' });
            }
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        next(error);
    }
};

const forgotPassword = async (req, res, next) => {
    const { email } = req.body;
    try {
        const [userRows] = await pool.query('SELECT id, name FROM users WHERE email = ?', [email]);
        if (userRows.length === 0) {
            // Don't reveal if user exists, for security
            return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
        }
        
        const user = userRows[0];
        const resetToken = crypto.randomBytes(32).toString('hex');
        const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await pool.query(
            'UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE id = ?',
            [passwordResetToken, passwordResetExpires, user.id]
        );
            
        const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
        
        await sendPasswordResetEmail({
            to: email,
            name: user.name,
            resetUrl: resetUrl,
        });
        
        res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });

    } catch (error) {
        next(error);
    }
};

const resetPassword = async (req, res, next) => {
    const { token, password } = req.body;
    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const [userRows] = await pool.query(
            'SELECT id FROM users WHERE password_reset_token = ? AND password_reset_expires > ?',
            [hashedToken, new Date()]
        );
        
        if (userRows.length === 0) {
            return res.status(400).json({ message: 'Token is invalid or has expired.' });
        }
        
        const user = userRows[0];
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        await pool.query(
            'UPDATE users SET password = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE id = ?',
            [hashedPassword, user.id]
        );
        
        res.json({ message: 'Password has been reset successfully.' });

    } catch (error) {
        next(error);
    }
};

module.exports = { registerUser, loginUser, forgotPassword, resetPassword };
