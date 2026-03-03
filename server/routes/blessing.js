const express = require('express');
const router = express.Router();
const blessingController = require('../controllers/blessingController');
const { auth, adminAuth } = require('../middleware/auth');

router.post('/submit', auth, blessingController.submitBlessing);
router.get('/my', auth, blessingController.getMyBlessings);
router.get('/list', blessingController.getBlessingList);
router.put('/:id/cancel', auth, blessingController.cancelBlessing);

router.get('/pending', adminAuth, blessingController.getPendingBlessings);
router.put('/:id/audit', adminAuth, blessingController.auditBlessing);
router.post('/batch-audit', adminAuth, blessingController.batchAuditBlessings);
router.delete('/:id', adminAuth, blessingController.deleteBlessing);

module.exports = router;
