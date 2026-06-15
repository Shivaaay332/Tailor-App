const express = require('express');
const { updateProfile, updateShop, backupData, resetData } = require('../controllers/settingsController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware'); // Image upload ke liye

const router = express.Router();

// Multer 'upload.single()' middleware lagaya taaki images receive ho sakein
router.put('/profile', protect, upload.single('profileImage'), updateProfile);
router.put('/shop', protect, upload.single('shopLogo'), updateShop);

router.get('/backup', protect, backupData);
router.delete('/reset', protect, resetData);

module.exports = router;