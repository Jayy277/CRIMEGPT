const express = require('express');
const { login, signup, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Only admins can signup/register officers/analysts
router.post('/signup', protect, restrictTo('admin'), signup);

module.exports = router;
