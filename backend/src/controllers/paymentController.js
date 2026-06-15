const prisma = require('../config/db');

// 1. Nayi Kisht (Installment) Jama Karna
const addPayment = async (req, res, next) => {
  try {
    const { orderId, amount, paymentMethod } = req.body;
    const shopId = req.shopId;

    if (!orderId || !amount) {
      return res.status(400).json({ success: false, message: "Order ID aur Amount zaroori hai." });
    }

    // Pehle Order check karein
    const order = await prisma.order.findFirst({
      where: { id: orderId, shopId },
      include: { items: true, payments: true }
    });

    if (!order) return res.status(404).json({ success: false, message: "Order nahi mila." });

    // Pending hisaab nikalna
    const totalBill = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalPaid = order.payments.reduce((sum, pay) => sum + pay.installmentAmount, 0);
    const pendingAmount = totalBill - totalPaid;

    if (parseFloat(amount) > pendingAmount) {
      return res.status(400).json({ success: false, message: `Baki sirf ₹${pendingAmount} hain. Aap zyada amount nahi daal sakte.` });
    }

    const newRemainingAmount = pendingAmount - parseFloat(amount);

    // FIX: Yahan se 'notes' aur 'paymentDate' hata diye gaye hain
    const newPayment = await prisma.payment.create({
      data: {
        orderId: orderId,
        totalAmount: totalBill,
        installmentAmount: parseFloat(amount),
        remainingAmount: newRemainingAmount,
        paymentMethod: paymentMethod || 'CASH'
      }
    });

    res.status(201).json({ success: true, message: "Payment successfully jama ho gayi!", data: newPayment });
  } catch (error) {
    next(error);
  }
};

// 2. Ek Grahak Ka Poora Ledger (Hisaab-Kitab) Lana
const getCustomerLedger = async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const shopId = req.shopId;

    const payments = await prisma.payment.findMany({
      where: { order: { customerId: customerId, shopId: shopId } },
      orderBy: { createdAt: 'desc' }, // paymentDate ki jagah createdAt kar diya
      include: { order: { select: { orderNumber: true } } }
    });

    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

module.exports = { addPayment, getCustomerLedger };