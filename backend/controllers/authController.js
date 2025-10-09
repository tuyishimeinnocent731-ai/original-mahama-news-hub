const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { formatUserFromDb } = require('../utils/userFormatter');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const registerUser = async (req, res, next) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [userExists] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
        if (userExists.length > 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(String(password), salt);
        
        const newUser = {
            id: `user-${uuidv4()}`,
            name,
            email,
            password_hash,
            avatar: `https://i.pravatar.cc/150?u=${email}`,
            subscription: 'free',
            role: 'user',
        };

        await connection.query('INSERT INTO users SET ?', newUser);
        await connection.query('INSERT INTO user_settings (user_id) VALUES (?)', [newUser.id]);

        await connection.commit();
        
        // Fetch the full user object to ensure a consistent response with login
        const [fullUserRows] = await connection.query(formatUserFromDb.userQuery, [newUser.id]);
        
        if (fullUserRows.length > 0) {
            const fullUser = formatUserFromDb(fullUserRows[0]);
            res.status(201).json({
                ...fullUser,
                token: generateToken(fullUser.id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data after creation' });
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

    // Static admin credentials check
    if (email === 'reponsekdz0@gmail.com' && String(password) === '2025') {
        try {
            const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
            if (users.length === 0) {
                return res.status(401).json({ message: 'Static admin account not found in DB.' });
            }
            const user = users[0];
            
            await pool.query('INSERT INTO activity_log (user_id, action_type, ip_address, details) VALUES (?, ?, ?, ?)', [
                user.id, 'login', req.ipAddress, JSON.stringify({ device: req.headers['user-agent'], method: 'static_password' })
            ]);

            const [fullUserRows] = await pool.query(formatUserFromDb.userQuery, [user.id]);
            const fullUser = formatUserFromDb(fullUserRows[0]);
            
            res.json({
                ...fullUser,
                token: generateToken(user.id),
            });
            return; 
        } catch (error) {
            return next(error);
        }
    }


    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        // Ensure password is a string for bcrypt comparison
        if (await bcrypt.compare(String(password), user.password_hash)) {

            // Log activity
            await pool.query('INSERT INTO activity_log (user_id, action_type, ip_address, details) VALUES (?, ?, ?, ?)', [
                user.id, 'login', req.ipAddress, JSON.stringify({ device: req.headers['user-agent'] })
            ]);
            
            // Add a welcome back notification
            await pool.query('INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)', [
                user.id, 'update', `Welcome back, ${user.name.split(' ')[0]}! Here's what you missed.`
            ]);
            
            // Fetch comprehensive user data
            const [fullUserRows] = await pool.query(formatUserFromDb.userQuery, [user.id]);
            const fullUser = formatUserFromDb(fullUserRows[0]);
            
            res.json({
                ...fullUser,
                token: generateToken(user.id),
            });
        } else {
            res.status(400).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        next(error);
    }
};

const loginWithGoogle = async (req, res, next) => {
    const { token } = req.body;
    const connection = await pool.getConnection();
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, picture: avatar } = payload;

        const [existingUsers] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
        
        let userId;

        if (existingUsers.length > 0) {
            userId = existingUsers[0].id;
        } else {
            // Create a new user
            await connection.beginTransaction();

            const randomPassword = crypto.randomBytes(20).toString('hex');
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(randomPassword, salt);

            const newUser = {
                id: `user-${uuidv4()}`,
                name,
                email,
                password_hash,
                avatar,
                subscription: 'free',
                role: 'user',
            };
            
            await connection.query('INSERT INTO users SET ?', newUser);
            await connection.query('INSERT INTO user_settings (user_id) VALUES (?)', [newUser.id]);
            
            await connection.commit();
            userId = newUser.id;
        }

        // Log activity
        await connection.query('INSERT INTO activity_log (user_id, action_type, ip_address, details) VALUES (?, ?, ?, ?)', [
            userId, 'login', req.ipAddress, JSON.stringify({ device: req.headers['user-agent'], method: 'google' })
        ]);

        // Fetch comprehensive user data
        const [fullUserRows] = await connection.query(formatUserFromDb.userQuery, [userId]);
        const fullUser = formatUserFromDb(fullUserRows[0]);
        
        res.json({
            ...fullUser,
            token: generateToken(userId),
        });

    } catch (error) {
        if(connection) await connection.rollback();
        next(error);
    } finally {
        if(connection) connection.release();
    }
};

module.exports = { registerUser, loginUser, loginWithGoogle };