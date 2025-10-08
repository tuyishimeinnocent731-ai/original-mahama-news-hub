const express = require('express');
const router = express.Router();
const { 
    getAllUsers, 
    createUser, 
    updateUser, 
    deleteUser,
    getUserProfile,
    updateUserProfile,
    updateUserSettings,
    getSavedArticles,
    toggleSavedArticle,
    clearSearchHistory,
    changePassword,
    addUserAd,
    upgradeSubscription,
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    getUserApplications,
    deleteUserAccount,
} = require('../controllers/userController');
const { protect, admin, proUser } = require('../middleware/authMiddleware');
const { upload } = require('../controllers/articleController'); // Re-use image upload logic

// Admin routes
router.route('/').get(protect, admin, getAllUsers).post(protect, admin, createUser);
router.route('/:id').put(protect, admin, updateUser).delete(protect, admin, deleteUser);

// Profile routes for logged-in user
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, upload.single('avatar'), updateUserProfile);
    
router.put('/settings', protect, updateUserSettings);
router.put('/password', protect, changePassword);
router.delete('/me/account', protect, deleteUserAccount);


router.route('/saved')
    .get(protect, getSavedArticles);

router.route('/saved/:articleId')
    .post(protect, toggleSavedArticle);

router.delete('/search-history', protect, clearSearchHistory);

router.post('/ads', protect, proUser, upload.single('image'), addUserAd);
router.post('/subscription', protect, upgradeSubscription);

// Notification routes
router.route('/notifications')
    .get(protect, getNotifications);

router.put('/notifications/:id/read', protect, markNotificationRead);
router.post('/notifications/read-all', protect, markAllNotificationsRead);
router.delete('/notifications/:id', protect, deleteNotification);

// Application routes
router.get('/me/applications', protect, getUserApplications);


module.exports = router;