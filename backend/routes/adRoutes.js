const express = require('express');
const router = express.Router();
const { getAllAds, createAd, updateAd, deleteAd } = require('../controllers/adController');
const { protect, admin } = require('../middleware/authMiddleware');
const { upload } = require('../controllers/articleController'); // Re-use upload logic

router.route('/')
    .get(getAllAds)
    .post(protect, admin, upload.single('image'), createAd);

router.route('/:id')
    .put(protect, admin, upload.single('image'), updateAd)
    .delete(protect, admin, deleteAd);

module.exports = router;