const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, adminAuth } = require('../middleware/auth');

router.post('/login', userController.login);
router.post('/login-by-student', userController.loginByStudent);
router.post('/bind-student', auth, userController.bindStudent);
router.get('/info', auth, userController.getUserInfo);
router.put('/info', auth, userController.updateUserInfo);
router.get('/check-login', auth, userController.checkLogin);
router.post('/logout', auth, userController.logout);
router.post('/change-password', auth, userController.changePassword);
router.get('/stats', auth, userController.getUserStats);
router.get('/history', auth, userController.getUserHistory);

router.get('/list', adminAuth, userController.getUserList);
router.get('/export', adminAuth, userController.exportUsers);
router.post('/import', adminAuth, userController.importUsers);
router.post('/batch-status', adminAuth, userController.batchUpdateStatus);
router.post('/batch-update', adminAuth, userController.batchUpdateUsers);
router.post('/batch-reset-password', adminAuth, userController.batchResetPassword);
router.post('/batch-delete', adminAuth, userController.batchDeleteUsers);
router.get('/notifications', auth, userController.getNotifications);
router.put('/notifications/:id/read', auth, userController.markNotificationAsRead);
router.put('/notifications/read-all', auth, userController.markAllNotificationsAsRead);

router.get('/colleges', adminAuth, userController.getColleges);
router.get('/majors', adminAuth, userController.getMajors);
router.get('/grades', adminAuth, userController.getGrades);
router.get('/classes', adminAuth, userController.getClasses);
router.get('/:id', adminAuth, userController.getUserDetail);
router.put('/:id', adminAuth, userController.updateUser);
router.put('/:id/status', adminAuth, userController.updateUserStatus);
router.put('/:id/password', adminAuth, userController.resetUserPassword);
router.delete('/:id', adminAuth, userController.deleteUser);

module.exports = router;
