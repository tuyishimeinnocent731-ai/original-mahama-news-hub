const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const getUserProfile = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT u.*, 
                   (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', sh.id, 'query', sh.query, 'created_at', sh.created_at)) FROM (SELECT * FROM search_history WHERE user_id = u.id ORDER BY created_at DESC LIMIT 5) sh) as searchHistory,
                   (SELECT JSON_ARRAYAGG(sa.article_id) FROM saved_articles sa WHERE sa.user_id = u.id) as savedArticles,
                   (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', ad.id, 'headline', ad.headline, 'image', ad.image, 'url', ad.url)) FROM ads ad WHERE ad.user_id = u.id) as userAds,
                   (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', ph.id, 'date', ph.date, 'plan', ph.plan, 'amount', ph.amount, 'method', ph.method, 'status', ph.status)) FROM payment_history ph WHERE ph.user_id = u.id ORDER BY ph.date DESC) as paymentHistory
            FROM users u 
            WHERE u.id = ?
        `, [req.user.id]);
        
        if (rows.length > 0) {
            const user = rows[0];
            delete user.password_hash;
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateUserProfile = async (req, res) => {
    const { name, bio, socials } = req.body;
    const userId = req.user.id;
    
    try {
        const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });
        
        const user = users[0];
        const updatedFields = {
            name: name || user.name,
            bio: bio || user.bio,
            socials: socials ? JSON.stringify(JSON.parse(socials)) : user.socials,
            avatar: req.file ? `/uploads/${req.file.filename}` : user.avatar,
        };

        await pool.query('UPDATE users SET ? WHERE id = ?', [updatedFields, userId]);

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateUserSettings = async (req, res) => {
    const { settings } = req.body;
    try {
        await pool.query('UPDATE users SET settings = ? WHERE id = ?', [JSON.stringify(settings), req.user.id]);
        res.json({ message: 'Settings updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getSavedArticles = async (req, res) => {
    try {
        const [saved] = await pool.query('SELECT article_id FROM saved_articles WHERE user_id = ?', [req.user.id]);
        const articleIds = saved.map(s => s.article_id);
        if (articleIds.length === 0) {
            return res.json([]);
        }
        const [articles] = await pool.query('SELECT * FROM articles WHERE id IN (?)', [articleIds]);
        res.json(articles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const toggleSavedArticle = async (req, res) => {
    const { articleId } = req.params;
    const userId = req.user.id;

    try {
        const [existing] = await pool.query('SELECT * FROM saved_articles WHERE user_id = ? AND article_id = ?', [userId, articleId]);
        if (existing.length > 0) {
            await pool.query('DELETE FROM saved_articles WHERE user_id = ? AND article_id = ?', [userId, articleId]);
            res.json({ message: 'Article unsaved' });
        } else {
            await pool.query('INSERT INTO saved_articles (user_id, article_id) VALUES (?, ?)', [userId, articleId]);
            res.json({ message: 'Article saved' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const clearSearchHistory = async (req, res) => {
    try {
        await pool.query('DELETE FROM search_history WHERE user_id = ?', [req.user.id]);
        res.json({ message: 'Search history cleared' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
     try {
        const [users] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = users[0];
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });
        
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(newPassword, salt);
        
        await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, req.user.id]);
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const addUserAd = async (req, res) => {
    const { headline, url } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    if (!headline || !url || !image) {
        return res.status(400).json({ message: 'Missing required fields for ad' });
    }
    const newAd = {
        id: `ad-${uuidv4()}`,
        headline,
        url,
        image,
        user_id: req.user.id
    };
    try {
        await pool.query('INSERT INTO ads SET ?', newAd);
        res.status(201).json(newAd);
    } catch(err) {
        res.status(500).json({message: 'Server Error'});
    }
};

const upgradeSubscription = async (req, res) => {
    const { plan, amount, method } = req.body;
    const userId = req.user.id;
    
    try {
        const newPayment = {
            id: `pay-${uuidv4()}`,
            user_id: userId,
            date: new Date(),
            plan,
            amount,
            method,
            status: 'succeeded'
        };

        await pool.query('INSERT INTO payment_history SET ?', newPayment);
        await pool.query('UPDATE users SET subscription = ? WHERE id = ?', [plan, userId]);
        
        res.json({ message: 'Subscription upgraded successfully' });
    } catch(err) {
        res.status(500).json({message: 'Server Error'});
    }
}


// --- ADMIN CONTROLLERS ---
const getAllUsers = async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, name, email, avatar, role, subscription FROM users');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const createUser = async (req, res) => {
    const { name, email, password, role, subscription } = req.body;
    try {
        const [userExists] = await pool.query('SELECT email FROM users WHERE email = ?', [email]);
        if (userExists.length > 0) return res.status(400).json({ message: 'User already exists' });
        
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const newUser = {
            id: `user-${uuidv4()}`,
            name, email, password_hash, role, subscription,
            avatar: `https://i.pravatar.cc/150?u=${email}`,
            settings: '{}'
        };
        await pool.query('INSERT INTO users SET ?', newUser);
        delete newUser.password_hash;
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, role, subscription } = req.body;
    try {
        const fieldsToUpdate = { name, email, role, subscription };
        await pool.query('UPDATE users SET ? WHERE id = ?', [fieldsToUpdate, id]);
        res.json({ message: 'User updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { 
    getAllUsers, createUser, updateUser, deleteUser,
    getUserProfile, updateUserProfile, updateUserSettings,
    getSavedArticles, toggleSavedArticle, clearSearchHistory,
    changePassword, addUserAd, upgradeSubscription,
};
