const express = require('express');
const { body } = require('express-validator');
const { register, login, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post(
  '/register',
  [
    body('name', 'Name is required').notEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('username', 'Username is required').notEmpty(),
    body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  register
);

router.post('/login', login);
router.post('/logout', logout);

router.get('/me', protect, getMe);

module.exports = router;
