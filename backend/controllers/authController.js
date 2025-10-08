const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { formatUserFromDb } = require('../utils/userFormatter');

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
        const password_hash = await bcrypt.hash(password, salt);
        
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
        
        const [createdUserRows] = await pool.query('SELECT * FROM users WHERE id = ?', [newUser.id]);
        const createdUser = createdUserRows[0];

        if (createdUser) {
            res.status(201).json({
                id: createdUser.id,
                name: createdUser.name,
                email: createdUser.email,
                role: createdUser.role,
                token: generateToken(createdUser.id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
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
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        if (await bcrypt.compare(password, user.password_hash)) {

            // Log activity
            await pool.query('INSERT INTO activity_log (user_id, action_type, ip_address, details) VALUES (?, ?, ?, ?)', [
                user.id, 'login', req.ipAddress, JSON.stringify({ device: req.headers['user-agent'] })
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

module.exports = { registerUser, loginUser };
