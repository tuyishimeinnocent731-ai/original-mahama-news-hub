const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const registerUser = async (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    try {
        const [userExists] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (userExists.length > 0) {
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
            settings: JSON.stringify({}) // Default empty settings
        };

        await pool.query('INSERT INTO users SET ?', newUser);
        
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
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        if (await bcrypt.compare(password, user.password_hash)) {
            const [fullUserRows] = await pool.query(`
                SELECT u.*, 
                       (SELECT JSON_ARRAYAGG(sh.query) FROM (SELECT query FROM search_history WHERE user_id = u.id ORDER BY created_at DESC LIMIT 5) sh) as searchHistory,
                       (SELECT JSON_ARRAYAGG(sa.article_id) FROM saved_articles sa WHERE sa.user_id = u.id) as savedArticles,
                       (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', ad.id, 'headline', ad.headline, 'image', ad.image, 'url', ad.url)) FROM ads ad WHERE ad.user_id = u.id) as userAds,
                       (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', ph.id, 'date', ph.date, 'plan', ph.plan, 'amount', ph.amount, 'method', ph.method, 'status', ph.status)) FROM payment_history ph WHERE ph.user_id = u.id ORDER BY ph.date DESC) as paymentHistory
                FROM users u 
                WHERE u.id = ?
            `, [user.id]);
            
            const fullUser = fullUserRows[0];
            delete fullUser.password_hash;

            res.json({
                ...fullUser,
                token: generateToken(user.id),
            });
        } else {
            res.status(400).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { registerUser, loginUser };