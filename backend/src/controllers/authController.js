const prisma = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'tailor_super_secret_key', { expiresIn: '1d' });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET || 'tailor_refresh_secret', { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

// 1. Register
const register = async (req, res, next) => {
  try {
    const { name, email, mobile, password, shopName } = req.body;

    if (!name || !email || !password || !mobile) {
      return res.status(400).json({ success: false, message: "Saari details bharna zaroori hai." });
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email: email }, { mobile: mobile }] }
    });

    if (existingUser) return res.status(400).json({ success: false, message: "Email ya Mobile pehle se registered hai." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name, email, mobile, password: hashedPassword,
        shop: {
          create: { shopName: shopName || `${name} Tailors`, ownerName: name, mobile: mobile }
        }
      },
      include: { shop: true }
    });

    const { accessToken, refreshToken } = generateTokens(newUser.id);
    res.cookie('jwt', accessToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.status(201).json({ success: true, token: accessToken, user: newUser });
  } catch (error) {
    next(error);
  }
};

// 2. Login (SMART FIX APPLIED HERE)
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email aur Password dono dalein." });
    }

    // Email ya Mobile dono se login support karega
    let user = await prisma.user.findFirst({
      where: { OR: [{ email: email }, { mobile: email }] },
      include: { shop: true }
    });

    if (!user) return res.status(401).json({ success: false, message: "Account nahi mila. Kripya naya account banayein." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Password galat hai." });

    // FIX: Agar purana account hai aur Dukan nahi hai, toh automatically nayi bana do
    if (!user.shop) {
      const newShop = await prisma.shop.create({
        data: {
          userId: user.id,
          shopName: `${user.name} Tailors`,
          ownerName: user.name,
          mobile: user.mobile
        }
      });
      user.shop = newShop; // Nayi dukan user object me daal do
    }

    const { accessToken, refreshToken } = generateTokens(user.id);
    res.cookie('jwt', accessToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

    const userData = { id: user.id, name: user.name, email: user.email, role: user.role, profileImage: user.profileImage, shop: user.shop };
    res.status(200).json({ success: true, token: accessToken, user: userData });
  } catch (error) {
    next(error);
  }
};

const logout = (req, res) => {
  res.clearCookie('jwt');
  res.clearCookie('refreshToken');
  res.status(200).json({ success: true, message: "Successfully logged out" });
};

const refresh = (req, res) => {
  // ... (refresh code same as before)
};

module.exports = { register, login, logout, refresh };