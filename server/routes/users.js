const express = require('express');
const { getUserProfile, updateUserProfile, uploadAvatar } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

const router = express.Router();

router.get('/:username', getUserProfile);
router.put('/me', protect, updateUserProfile);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);

module.exports = router;
