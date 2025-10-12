const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { formatUserFromDb } = require('../utils/userFormatter');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
    try {
        const [userRows] = await pool.query(formatUserFromDb.userQuery, [req.user.id]);
        if (userRows.length > 0) {
            const user = formatUserFromDb(userRows[0]);
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
    const { name, bio, avatar, socials } = req.body;
    try {
        await pool.query(
            'UPDATE users SET name = ?, bio = ?, avatar = ?, socials = ? WHERE id = ?',
            [name, bio, avatar, JSON.stringify(socials), req.user.id]
        );
        const [userRows] = await pool.query(formatUserFromDb.userQuery, [req.user.id]);
        const updatedUser = formatUserFromDb(userRows[0]);
        res.json(updatedUser);
    } catch (error) {
        next(error);
    }
};

// @desc    Update user settings
// @route   PUT /api/users/settings
// @access  Private
const updateUserSettings = async (req, res, next) => {
    const { settings } = req.body;
    const userId = req.user.id;

    const dbSettings = {
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
        notifications_breaking_news: settings.notifications.breakingNews,
        notifications_weekly_digest: settings.notifications.weeklyDigest,
        notifications_special_offers: settings.notifications.specialOffers,
        font_size: settings.fontSize,
        high_contrast: settings.highContrast,
        reduce_motion: settings.reduceMotion,
        dyslexia_font: settings.dyslexiaFont,
        data_sharing: settings.dataSharing,
        ad_personalization: settings.adPersonalization,
    };

    try {
        await pool.query('UPDATE user_settings SET ? WHERE user_id = ?', [dbSettings, userId]);
        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        next(error);
    }
};


// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const [userRows] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
        const user = userRows[0];
        
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect current password.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
        res.json({ message: 'Password changed successfully.' });
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle a saved article for a user
// @route   POST /api/users/saved-articles
// @access  Private
const toggleSavedArticle = async (req, res, next) => {
    const { articleId } = req.body;
    const userId = req.user.id;
    try {
        const [existing] = await pool.query('SELECT * FROM saved_articles WHERE user_id = ? AND article_id = ?', [userId, articleId]);
        
        if (existing.length > 0) {
            await pool.query('DELETE FROM saved_articles WHERE user_id = ? AND article_id = ?', [userId, articleId]);
        } else {
            await pool.query('INSERT INTO saved_articles (user_id, article_id) VALUES (?, ?)', [userId, articleId]);
        }

        const [saved] = await pool.query('SELECT article_id FROM saved_articles WHERE user_id = ?', [userId]);
        res.json({ savedArticles: saved.map(s => s.article_id) });
    } catch (error) {
        next(error);
    }
};

// @desc    Clear user's search history
// @route   DELETE /api/users/search-history
// @access  Private
const clearSearchHistory = async (req, res, next) => {
    try {
        await pool.query('DELETE FROM search_history WHERE user_id = ?', [req.user.id]);
        res.json({ message: 'Search history cleared' });
    } catch (error) {
        next(error);
    }
};

// ADMIN CONTROLLERS

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
const getAllUsers = async (req, res, next) => {
    try {
        // A simplified query for the list view
        const [users] = await pool.query(`
            SELECT u.id, u.name, u.email, u.avatar, u.role, u.subscription,
            (SELECT JSON_ARRAYAGG(sh.query) FROM (SELECT query FROM search_history WHERE user_id = u.id ORDER BY created_at DESC LIMIT 5) sh) as searchHistory
            FROM users u
        `);
        res.json(users);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new user
// @route   POST /api/users
// @access  Admin
const createUser = async (req, res, next) => {
    const { name, email, password, role, subscription } = req.body;
    const connection = await pool.getConnection();

    try {
        const [userExists] = await connection.query('SELECT email FROM users WHERE email = ?', [email]);
        if (userExists.length > 0) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const userId = `user-${uuidv4()}`;
        
        await connection.beginTransaction();

        await connection.query(
            'INSERT INTO users (id, name, email, password, role, subscription, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, name, email, hashedPassword, role, subscription, `https://i.pravatar.cc/150?u=${userId}`]
        );
        await connection.query('INSERT INTO user_settings (user_id) VALUES (?)', [userId]);
        
        await connection.commit();

        const [userRows] = await connection.query(formatUserFromDb.userQuery, [userId]);
        res.status(201).json(formatUserFromDb(userRows[0]));

    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};


// @desc    Update a user
// @route   PUT /api/users/:id
// @access  Admin
const updateUser = async (req, res, next) => {
    const { id } = req.params;
    const { name, email, role, subscription } = req.body;
    try {
        await pool.query(
            'UPDATE users SET name = ?, email = ?, role = ?, subscription = ? WHERE id = ?',
            [name, email, role, subscription, id]
        );
        const [userRows] = await pool.query(formatUserFromDb.userQuery, [id]);
        res.json(formatUserFromDb(userRows[0]));
    } catch (error) {
        next(error);
    }
};


// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Admin
const deleteUser = async (req, res, next) => {
    try {
        await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Reset a user's password (admin)
// @route   POST /api/users/:id/reset-password
// @access  Admin
const adminResetPassword = async (req, res, next) => {
    const { id } = req.params;
    const temporaryPassword = require('crypto').randomBytes(8).toString('hex');
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(temporaryPassword, salt);
        await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
        res.json({ temporaryPassword });
    } catch (error) {
        next(error);
    }
};

const getApiKeys = async (req, res, next) => {
    try {
        const [keys] = await pool.query(
            'SELECT id, description, prefix, last_used, created_at FROM api_keys WHERE user_id = ?',
            [req.user.id]
        );
        res.json(keys);
    } catch (error) {
        next(error);
    }
};

const createApiKey = async (req, res, next) => {
    const { description } = req.body;
    const userId = req.user.id;
    
    const apiKey = `mnh_${require('crypto').randomBytes(24).toString('hex')}`;
    const prefix = apiKey.substring(0, 8);
    
    try {
        const salt = await bcrypt.genSalt(10);
        const keyHash = await bcrypt.hash(apiKey, salt);
        const keyId = `key-${uuidv4()}`;

        await pool.query(
            'INSERT INTO api_keys (id, user_id, description, prefix, key_hash) VALUES (?, ?, ?, ?, ?)',
            [keyId, userId, description, prefix, keyHash]
        );
        
        res.status(201).json({ key: apiKey, message: "API Key created. Please save it, you will not see it again." });
    } catch (error) {
        next(error);
    }
};

const deleteApiKey = async (req, res, next) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM api_keys WHERE id = ? AND user_id = ?', [id, req.user.id]);
        res.json({ message: 'API Key deleted.' });
    } catch (error) {
        next(error);
    }
};

const exportUserData = async (req, res, next) => {
    try {
        const [userRows] = await pool.query(formatUserFromDb.userQuery, [req.user.id]);
        const user = formatUserFromDb(userRows[0]);
        if (!user) return res.status(404).json({ message: "User not found" });

        const [savedArticlesRows] = await pool.query('SELECT * FROM articles WHERE id IN (SELECT article_id FROM saved_articles WHERE user_id = ?)', [req.user.id]);

        const exportData = {
            profile: {
                name: user.name,
                email: user.email,
                bio: user.bio,
            },
            settings: user.settings,
            savedArticles: savedArticlesRows,
        };
        res.json(exportData);
    } catch (error) {
        next(error);
    }
};

const getUserActivity = async (req, res, next) => {
     try {
        const [logs] = await pool.query('SELECT * FROM activity_log WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [req.params.id]);
        res.json(logs);
    } catch (error) {
        next(error);
    }
};

const getNotifications = async (req, res, next) => {
     try {
        const [notifications] = await pool.query('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
        res.json(notifications);
    } catch (error) {
        next(error);
    }
};

const markNotificationAsRead = async (req, res, next) => {
    try {
        await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        next(error);
    }
};

const markAllNotificationsAsRead = async (req, res, next) => {
     try {
        await pool.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [req.user.id]);
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        next(error);
    }
};

const deleteNotification = async (req, res, next) => {
     try {
        await pool.query('DELETE FROM notifications WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ message: 'Notification deleted' });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    getUserProfile,
    updateUserProfile,
    updateUserSettings,
    changePassword,
    toggleSavedArticle,
    clearSearchHistory,
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    adminResetPassword,
    getApiKeys,
    createApiKey,
    deleteApiKey,
    exportUserData,
    getUserActivity,
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
};
