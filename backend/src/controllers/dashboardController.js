const prisma = require('../config/db');

const getDashboardSummary = async (req, res, next) => {
  try {
    const shopId = req.shopId; // Token se aayi dukan ki ID

    // 1 & 2. Customers aur Orders ka total count
    const totalCustomers = await prisma.customer.count({ where: { shopId } });
    const totalOrders = await prisma.order.count({ where: { shopId } });

    // 3. Pending Orders (Jo abhi ban rahe hain ya pending hain)
    const pendingOrders = await prisma.order.count({
      where: { shopId, status: { in: ['PENDING', 'CUTTING', 'STITCHING'] } }
    });

    // 4. Ready Orders (Jo sil gaye hain par customer le nahi gaya)
    const readyOrders = await prisma.order.count({
      where: { shopId, status: 'READY' }
    });

    // 5. Delivered Orders
    const deliveredOrders = await prisma.order.count({
      where: { shopId, status: 'DELIVERED' }
    });

    // 6. Today's Income (Aaj kitna paisa aaya)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todaysPayments = await prisma.payment.aggregate({
      where: {
        order: { shopId },
        paymentDate: { gte: startOfToday, lte: endOfToday }
      },
      _sum: { installmentAmount: true }
    });
    const todaysIncome = todaysPayments._sum.installmentAmount || 0;

    // 7. Pending Payments (Bazar me kitna paisa fasa hai)
    // Sahi Tareeka: Saare orders mangwao aur JS me calculate karo
    const allOrders = await prisma.order.findMany({
      where: { shopId },
      include: {
        items: true,
        payments: true
      }
    });

    let totalBilled = 0;
    let totalReceived = 0;

    allOrders.forEach(order => {
      // Ek order ka total bill (Price x Quantity)
      const orderTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      totalBilled += orderTotal;

      // Ek order me ab tak kitna paisa mil chuka hai
      const orderPaid = order.payments.reduce((sum, pay) => sum + pay.installmentAmount, 0);
      totalReceived += orderPaid;
    });

    const pendingPayments = totalBilled - totalReceived;

    res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        totalOrders,
        pendingOrders,
        readyOrders,
        deliveredOrders,
        todaysIncome,
        pendingPayments
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardSummary };