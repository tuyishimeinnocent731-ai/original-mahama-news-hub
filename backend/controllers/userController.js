const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { formatUserFromDb } = require('../utils/userFormatter');


const getUserProfile = async (req, res, next) => {
    try {
        const [rows] = await pool.query(formatUserFromDb.userQuery, [req.user.id]);
        
        if (rows.length > 0) {
            const user = formatUserFromDb(rows[0]);
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        next(error);
    }
};

const updateUserProfile = async (req, res, next) => {
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
        next(error);
    }
};

const updateUserSettings = async (req, res, next) => {
    const { settings } = req.body;
    if (!settings) {
        return res.status(400).json({ message: 'Settings object is required.' });
    }
    
    try {
        const fields = {
            theme_name: settings.theme.name,
            theme_accent: settings.theme.accent,
            font_family: settings.font.family,
            font_weight: settings.font.weight,
            homepage_layout: settings.layout.homepage,
            content_density: settings.layout.density,
            infinite_scroll: settings.layout.infiniteScroll,
            card_style: settings.ui.cardStyle,
            border_radius: settings.ui.borderRadius,
            auto_play_audio: settings.reading.autoPlayAudio,
            default_summary_view: settings.reading.defaultSummaryView,
            line_height: settings.reading.lineHeight,
            letter_spacing: settings.reading.letterSpacing,
            justify_text: settings.reading.justifyText,
            font_size: settings.fontSize,
            high_contrast: settings.highContrast,
            reduce_motion: settings.reduceMotion,
            dyslexia_font: settings.dyslexiaFont,
            notifications_breaking_news: settings.notifications.breakingNews,
            notifications_weekly_digest: settings.notifications.weeklyDigest,
            notifications_special_offers: settings.notifications.specialOffers,
            data_sharing: settings.dataSharing,
            ad_personalization: settings.adPersonalization,
        };
        
        await pool.query('UPDATE user_settings SET ? WHERE user_id = ?', [fields, req.user.id]);
        res.json({ message: 'Settings updated' });
    } catch (error) {
        next(error);
    }
};

const getSavedArticles = async (req, res, next) => {
    try {
        const [saved] = await pool.query('SELECT article_id FROM saved_articles WHERE user_id = ?', [req.user.id]);
        const articleIds = saved.map(s => s.article_id);
        if (articleIds.length === 0) {
            return res.json([]);
        }
        const [articles] = await pool.query('SELECT * FROM articles WHERE id IN (?)', [articleIds]);
        res.json(articles);
    } catch (error) {
        next(error);
    }
};

const toggleSavedArticle = async (req, res, next) => {
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
        next(error);
    }
};

const clearSearchHistory = async (req, res, next) => {
    try {
        await pool.query('DELETE FROM search_history WHERE user_id = ?', [req.user.id]);
        res.json({ message: 'Search history cleared' });
    } catch (error) {
        next(error);
    }
};

const changePassword = async (req, res, next) => {
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
        await pool.query('INSERT INTO activity_log (user_id, action_type, ip_address) VALUES (?, ?, ?)', [req.user.id, 'password_change', req.ipAddress]);

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        next(error);
    }
};

const addUserAd = async (req, res, next) => {
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
        next(err);
    }
};

const upgradeSubscription = async (req, res, next) => {
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
        next(err);
    }
}


// --- ADMIN CONTROLLERS ---
const getAllUsers = async (req, res, next) => {
    try {
        const [users] = await pool.query('SELECT id, name, email, avatar, role, subscription FROM users');
        res.json(users);
    } catch (error) {
        next(error);
    }
};

const createUser = async (req, res, next) => {
    const { name, email, password, role, subscription } = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [userExists] = await connection.query('SELECT email FROM users WHERE email = ?', [email]);
        if (userExists.length > 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'User already exists' });
        }
        
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const newUser = {
            id: `user-${uuidv4()}`,
            name, email, password_hash, role, subscription,
            avatar: `https://i.pravatar.cc/150?u=${email}`
        };
        await connection.query('INSERT INTO users SET ?', newUser);
        await connection.query('INSERT INTO user_settings (user_id) VALUES (?)', [newUser.id]);
        
        await connection.commit();
        
        delete newUser.password_hash;
        res.status(201).json(newUser);
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

const updateUser = async (req, res, next) => {
    const { id } = req.params;
    const { name, email, role, subscription } = req.body;
    try {
        const fieldsToUpdate = { name, email, role, subscription };
        await pool.query('UPDATE users SET ? WHERE id = ?', [fieldsToUpdate, id]);
        res.json({ message: 'User updated' });
    } catch (error) {
        next(error);
    }
};

const deleteUser = async (req, res, next) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'User deleted' });
    } catch (error) {
        next(error);
    }
};

module.exports = { 
    getAllUsers, createUser, updateUser, deleteUser,
    getUserProfile, updateUserProfile, updateUserSettings,
    getSavedArticles, toggleSavedArticle, clearSearchHistory,
    changePassword, addUserAd, upgradeSubscription,
};
