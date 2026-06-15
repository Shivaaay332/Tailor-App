const prisma = require('../config/db');

// 1. Naya Order Create Karna
const createOrder = async (req, res, next) => {
  try {
    const { customerId, totalAmount, advanceAmount, dueDate, notes, items, paymentMethod } = req.body;
    const shopId = req.shopId;

    if (!customerId || !totalAmount || !dueDate || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Order ki zaroori details missing hain." });
    }

    // Security: Customer apni hi dukan ka hona chahiye
    const customer = await prisma.customer.findFirst({ where: { id: customerId, shopId } });
    if (!customer) return res.status(404).json({ success: false, message: "Grahak nahi mila." });

    // Naya Order Number banayein (e.g., ORD-2026-001)
    const orderCount = await prisma.order.count({ where: { shopId } });
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(orderCount + 1).padStart(3, '0')}`;

    const advance = parseFloat(advanceAmount || 0);
    const total = parseFloat(totalAmount);
    const remaining = total - advance;

    // Prisma Transaction se ek hi baar me Order, Items aur Payment save karenge
    const order = await prisma.order.create({
      data: {
        shopId,
        customerId,
        orderNumber,
        deliveryDate: new Date(dueDate),
        
        items: {
          create: items.map(item => ({
            garmentType: item.garmentType.toUpperCase(),
            measurementId: item.measurementId,
            price: parseFloat(item.price),
            quantity: parseInt(item.quantity || 1),
            notes: item.notes || notes
          }))
        },

        // Agar advance diya hai toh payment ki history banegi
        payments: advance > 0 ? {
          create: [{
            totalAmount: total,
            advanceAmount: advance,
            installmentAmount: advance, // Aaj advance hi installment hai
            remainingAmount: remaining,
            paymentMethod: paymentMethod || 'CASH'
          }]
        } : undefined
      },
      include: { items: true, payments: true }
    });

    res.status(201).json({ success: true, message: "Order successfully ban gaya!", data: order });

  } catch (error) {
    next(error);
  }
};

// 2. Apni Dukan ke Saare Orders lana
const getAllOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    const shopId = req.shopId;

    const filter = { shopId };
    if (status) filter.status = status.toUpperCase();

    const orders = await prisma.order.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { name: true, mobile: true } },
        items: true,
        payments: true
      }
    });

    res.status(200).json({ success: true, count: orders.length, data: orders });

  } catch (error) {
    next(error);
  }
};

// 3. Status Update Karna
const updateOrderStatus = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    const shopId = req.shopId;

    const order = await prisma.order.findFirst({ where: { id: orderId, shopId } });
    if (!order) return res.status(404).json({ success: false, message: "Order nahi mila." });

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: status.toUpperCase() }
    });

    res.status(200).json({ success: true, message: `Status ab '${status}' ho gaya hai.`, data: updatedOrder });

  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getAllOrders, updateOrderStatus };