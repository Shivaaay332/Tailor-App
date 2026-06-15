const prisma = require('../config/db');

// 1. Profile Update (Naam aur Photo)
const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    const userId = req.userId || req.user.id; // Ab ye 100% kaam karega

    let updateData = { name };

    if (req.file) {
      updateData.profileImage = req.file.path.replace(/\\/g, '/');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: { shop: true } 
    });

    res.status(200).json({ success: true, message: "Profile update ho gayi!", data: updatedUser });
  } catch (error) {
    next(error);
  }
};

// 2. Shop Update (Dukan ka Naam, Address aur Logo)
const updateShop = async (req, res, next) => {
  try {
    const { shopName, address } = req.body;
    const shopId = req.shopId;

    let updateData = {};
    if (shopName) updateData.shopName = shopName;
    if (address) updateData.address = address;

    if (req.file) {
      updateData.logo = req.file.path.replace(/\\/g, '/');
    }

    const updatedShop = await prisma.shop.update({
      where: { id: shopId },
      data: updateData
    });

    res.status(200).json({ success: true, message: "Dukan ki details update ho gayi!", data: updatedShop });
  } catch (error) {
    next(error);
  }
};

// 3. Backup Data
const backupData = async (req, res, next) => {
  try {
    const shopId = req.shopId;
    const customers = await prisma.customer.findMany({
      where: { shopId },
      include: { measurements: true, orders: { include: { items: true, payments: true } } }
    });
    const shopDetails = await prisma.shop.findUnique({ where: { id: shopId } });

    res.status(200).json({ success: true, data: { timestamp: new Date(), shop: shopDetails, data: customers } });
  } catch (error) {
    next(error);
  }
};

// 4. Reset All Data (Danger Zone)
const resetData = async (req, res, next) => {
  try {
    const shopId = req.shopId;
    await prisma.$transaction([
      prisma.payment.deleteMany({ where: { order: { shopId } } }),
      prisma.orderItem.deleteMany({ where: { order: { shopId } } }),
      prisma.order.deleteMany({ where: { shopId } }),
      prisma.measurement.deleteMany({ where: { customer: { shopId } } }),
      prisma.customer.deleteMany({ where: { shopId } })
    ]);
    res.status(200).json({ success: true, message: "Saara data successfully delete ho gaya hai." });
  } catch (error) {
    next(error);
  }
};

module.exports = { updateProfile, updateShop, backupData, resetData };