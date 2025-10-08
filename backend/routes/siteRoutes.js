const express = require('express');
const router = express.Router();
const { 
    getNavLinks, 
    updateNavLinks, 
    getSiteSettings, 
    updateSiteSettings,
    getPage,
    updatePage,
    submitContactMessage,
    getContactMessages,
    updateContactMessage,
    deleteContactMessage,
    getJobPostings,
    submitJobApplication,
    createJobPosting,
    updateJobPosting,
    deleteJobPosting,
    getJobApplications,
} = require('../controllers/siteController');
const { protect, admin } = require('../middleware/authMiddleware');
const { resumeUpload } = require('../middleware/uploadMiddleware');

router.route('/nav-links')
    .get(getNavLinks)
    .put(protect, admin, updateNavLinks);

router.route('/settings')
    .get(getSiteSettings)
    .put(protect, admin, updateSiteSettings);

// Page Content Management
router.route('/pages/:slug')
    .get(getPage)
    .put(protect, admin, updatePage);

// Contact Form Management
router.post('/contact', submitContactMessage);
router.route('/contact-messages')
    .get(protect, admin, getContactMessages);
router.route('/contact-messages/:id')
    .put(protect, admin, updateContactMessage)
    .delete(protect, admin, deleteContactMessage);

// Careers & Jobs
router.get('/jobs', getJobPostings);
router.post('/jobs/:id/apply', resumeUpload.single('resume'), submitJobApplication);

// Admin Job Management
router.route('/jobs')
    .post(protect, admin, createJobPosting);
router.route('/jobs/:id')
    .put(protect, admin, updateJobPosting)
    .delete(protect, admin, deleteJobPosting);
router.get('/jobs/:id/applications', protect, admin, getJobApplications);


module.exports = router;