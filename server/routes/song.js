const express = require('express');
const router = express.Router();
const songController = require('../controllers/songController');
const categoryController = require('../controllers/categoryController');
const { adminAuth } = require('../middleware/auth');

router.get('/search', songController.searchSongs);
router.get('/list', songController.getSongList);
router.get('/hot', songController.getHotSongs);
router.get('/new', songController.getNewSongs);
router.get('/export', adminAuth, songController.exportSongs);
router.post('/import', adminAuth, songController.importSongs);
router.post('/batch-status', adminAuth, songController.batchUpdateStatus);
router.post('/batch-update', adminAuth, songController.batchUpdateSongs);
router.post('/batch-delete', adminAuth, songController.batchDeleteSongs);

router.get('/categories', categoryController.getCategories);
router.get('/categories/all', adminAuth, categoryController.getAllCategories);
router.post('/categories', adminAuth, categoryController.addCategory);
router.put('/categories/:id', adminAuth, categoryController.updateCategory);
router.delete('/categories/:id', adminAuth, categoryController.deleteCategory);

router.get('/:id', songController.getSongDetail);
router.post('/', adminAuth, songController.addSong);
router.put('/:id', adminAuth, songController.updateSong);
router.put('/:id/status', adminAuth, songController.updateSongStatus);
router.delete('/:id', adminAuth, songController.deleteSong);

module.exports = router;
