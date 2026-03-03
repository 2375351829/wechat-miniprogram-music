const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { auth, adminAuth } = require('../middleware/auth');

router.post('/submit', auth, requestController.submitRequest);
router.get('/my', auth, requestController.getMyRequests);
router.get('/history', requestController.getRequestHistory);
router.get('/today', requestController.getTodayRequests);
router.get('/list', adminAuth, requestController.getRequestList);
router.put('/:id/cancel', auth, requestController.cancelRequest);

router.get('/pending', adminAuth, requestController.getPendingRequests);
router.put('/:id/audit', adminAuth, requestController.auditRequest);
router.post('/batch-audit', adminAuth, requestController.batchAuditRequests);
router.put('/:id/play', adminAuth, requestController.markAsPlayed);
router.delete('/:id', adminAuth, requestController.deleteRequest);

module.exports = router;
