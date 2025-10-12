const express = require('express');
const router = express.Router();
const {
    getUserProfile,
    updateUserProfile,
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
    updateUserSettings,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// Protected routes (require login)
router.use(protect);

router.route('/profile')
    .get(getUserProfile)
    .put(updateUserProfile);

router.put('/change-password', changePassword);
router.post('/saved-articles', toggleSavedArticle);
router.delete('/search-history', clearSearchHistory);
router.get('/export', exportUserData);
router.put('/settings', updateUserSettings);

// Notifications
router.route('/notifications')
    .get(getNotifications);
router.post('/notifications/read-all', markAllNotificationsAsRead);
router.route('/notifications/:id')
    .put(markNotificationAsRead)
    .delete(deleteNotification);

// API Keys
router.route('/api-keys')
    .get(getApiKeys)
    .post(createApiKey);
router.delete('/api-keys/:id', deleteApiKey);

// Admin-only routes
router.route('/')
    .get(admin, getAllUsers)
    .post(admin, createUser);

router.route('/:id')
    .put(admin, updateUser)
    .delete(admin, deleteUser);

router.post('/:id/reset-password', admin, adminResetPassword);
router.get('/:id/activity', admin, getUserActivity);

module.exports = router;
