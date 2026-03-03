const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { adminAuth, superAdminAuth } = require('../middleware/auth');

router.post('/login', adminController.login);
router.post('/logout', adminAuth, adminController.logout);
router.get('/info', adminAuth, adminController.getAdminInfo);
router.put('/password', adminAuth, adminController.changePassword);
router.get('/dashboard', adminAuth, adminController.getDashboard);

router.post('/create', adminAuth, adminController.createAdmin);
router.get('/list', superAdminAuth, adminController.getAdminList);
router.put('/:id', superAdminAuth, adminController.updateAdmin);
router.put('/:id/status', superAdminAuth, adminController.updateAdminStatus);
router.delete('/:id', superAdminAuth, adminController.deleteAdmin);

module.exports = router;
