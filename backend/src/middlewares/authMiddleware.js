const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const protect = async (req, res, next) => {
  try {
    let token;
    
    // Token nikalna (Cookies se ya Header se)
    if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Aap login nahi hain." });
    }

    // Token verify karna
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tailor_super_secret_key');
    
    // User ko dhoondhna aur uski ID set karna (Ye step fail ho raha tha pichli baar)
    const currentUser = await prisma.user.findUnique({ where: { id: decoded.id } });
    
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "User exist nahi karta." });
    }

    // Aage ke controllers ke liye data set karna
    req.user = currentUser;
    req.userId = currentUser.id;
    req.shopId = currentUser.shopId;
    
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Session expire ho gaya hai." });
  }
};

module.exports = { protect };