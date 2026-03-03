const express = require('express');
const router = express.Router();
const playController = require('../controllers/playController');
const { adminAuth } = require('../middleware/auth');

router.get('/display', playController.getPlayDisplay);
router.get('/history', playController.getPlayHistory);
router.get('/queue', adminAuth, playController.getPlayQueue);
router.get('/stats', adminAuth, playController.getPlayStats);
router.get('/status', adminAuth, playController.getPlayStatus);
router.post('/next', adminAuth, playController.playNext);
router.post('/stop', adminAuth, playController.stopPlay);
router.post('/toggle', adminAuth, playController.togglePlay);
router.put('/progress', adminAuth, playController.updatePlayProgress);
router.put('/volume', adminAuth, playController.updateVolume);
router.put('/mode', adminAuth, playController.setPlayMode);
router.put('/order', adminAuth, playController.updatePlayOrder);
router.post('/add-song', adminAuth, playController.addSongToQueue);
router.delete('/queue/:id', adminAuth, playController.removeFromQueue);
router.delete('/history/:id', adminAuth, playController.deleteHistory);
router.post('/history/batch-delete', adminAuth, playController.batchDeleteHistory);
router.put('/history/:id', adminAuth, playController.updateHistory);

module.exports = router;
