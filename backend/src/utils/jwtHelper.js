const jwt = require('jsonwebtoken');

// Ab hum token me shopId bhi bhejenge
const generateAccessToken = (userId, shopId) => {
  return jwt.sign(
    { userId, shopId }, 
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' } 
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' } 
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken
};