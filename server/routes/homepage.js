const express = require('express');
const router = express.Router();
const homepageController = require('../controllers/homepageController');
const { adminAuth } = require('../middleware/auth');

router.get('/data', homepageController.getHomepageData);
router.get('/banners', homepageController.getBanners);
router.get('/announcements', homepageController.getAnnouncements);
router.get('/recommend-songs', homepageController.getRecommendSongs);

router.post('/banners', adminAuth, homepageController.addBanner);
router.put('/banners/:id', adminAuth, homepageController.updateBanner);
router.delete('/banners/:id', adminAuth, homepageController.deleteBanner);

router.post('/announcements', adminAuth, homepageController.addAnnouncement);
router.put('/announcements/:id', adminAuth, homepageController.updateAnnouncement);
router.delete('/announcements/:id', adminAuth, homepageController.deleteAnnouncement);

router.post('/recommend-songs', adminAuth, homepageController.addRecommendSong);
router.put('/recommend-songs/:id', adminAuth, homepageController.updateRecommendSong);
router.delete('/recommend-songs/:id', adminAuth, homepageController.deleteRecommendSong);

router.put('/config', adminAuth, homepageController.updateHomepageConfig);

module.exports = router;
