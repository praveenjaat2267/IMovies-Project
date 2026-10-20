const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth');

// Public Authentication routes
router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOtp);
router.post('/resend-otp', authController.resendOtp);
router.post('/login', authController.login);
router.post('/send-login-otp', authController.sendLoginOtp);

// Protected routes
router.get('/me', verifyToken, authController.getProfile);

module.exports = router;
