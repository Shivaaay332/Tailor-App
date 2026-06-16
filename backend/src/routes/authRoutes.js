const express = require('express');
const upload = require('../middlewares/uploadMiddleware');
const { 
  register, 
  login, 
  logout,
  refresh
} = require('../controllers/authController');

const router = express.Router();

// Register Route me 2 files expect kar rahe hain (Profile aur Logo)
router.post('/register', upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'shopLogo', maxCount: 1 }
]), register);

router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);

module.exports = router;