const express = require('express');
const { registerValidation, loginValidation, resetPasswordValidation } = require('../validators/authValidator');
const authController = require('../controllers/authController');
const validateRequest = require('../middlewares/validateRequest');
const { authenticateAccessToken } = require('../middlewares/authMiddleware');
const csrf = require('csurf');
const rateLimit = require('express-rate-limit');

const authRouter = express.Router();
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Too many auth requests, try again later',
});
const sendVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 5, 
  message: 'Too many verification requests, try again later'
});
const sendResetOtpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 5, 
  message: 'Too many reset otp requests, try again later'
});
const csrfProtection = csrf({ cookie: true});

authRouter.post('/register', registerValidation, validateRequest, authController.register);
authRouter.post('/login-user', loginValidation, validateRequest, authController.login);
authRouter.post('/login-organizer', loginValidation, validateRequest, authController.organizerLogin);

authRouter.post('/refresh-token', authLimiter, authController.refreshToken);

authRouter.post('/logout', csrfProtection, authenticateAccessToken, authController.logout);
authRouter.post('/logout-all', csrfProtection, authenticateAccessToken, authController.logoutAll);

authRouter.post('/reset-pass-otp', authController.resetOTP);
authRouter.post('/reset-password', sendResetOtpLimiter, resetPasswordValidation, validateRequest, authController.resetPassword);

authRouter.post('/send-verification', authenticateAccessToken, sendVerificationLimiter, authController.sendVerificationEmail);
authRouter.get('/verify-email', authController.verifyEmail);

module.exports = authRouter;   