const express = require('express');
const upload = require('../middlewares/uploadMiddleware');
const { 
  registerOwner, 
  login, 
  refreshTokenLogic, 
  logout,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

const router = express.Router();

// Register Route me 2 files expect kar rahe hain (Profile aur Logo)
router.post('/register', upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'shopLogo', maxCount: 1 }
]), registerOwner);

router.post('/login', login);
router.post('/refresh', refreshTokenLogic);
router.post('/logout', logout);

// Password Reset Routes
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

module.exports = router;