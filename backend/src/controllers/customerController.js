const prisma = require('../config/db');

// 1. Naya Customer Add Karna (Serial No. aur Code apne aap banenge)
const addCustomer = async (req, res, next) => {
  try {
    const { name, mobile, address, notes } = req.body;
    const shopId = req.shopId; 

    if (!name || !mobile) {
      return res.status(400).json({ success: false, message: "Naam aur mobile number zaroori hai." });
    }

    const existingCustomer = await prisma.customer.findFirst({
      where: { mobile, shopId }
    });

    if (existingCustomer) {
      return res.status(400).json({ success: false, message: "Is mobile number se customer pehle se add hai!" });
    }

    const customerCount = await prisma.customer.count({ where: { shopId } });
    const customerCode = `CUST-${String(customerCount + 1).padStart(3, '0')}`;

    const customer = await prisma.customer.create({
      data: { shopId, customerCode, name, mobile, address, notes }
    });

    res.status(201).json({ success: true, message: "Customer successfully add ho gaya!", data: customer });
  } catch (error) {
    next(error);
  }
};

// 2. Customers List Lana (Search aur Filters ke liye)
const getAllCustomers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const shopId = req.shopId;

    let whereClause = { shopId };

    // Search Logic (Name, Mobile, Code, Serial Number)
    if (search) {
      whereClause = {
        ...whereClause,
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { mobile: { contains: search } },
          { customerCode: { contains: search, mode: 'insensitive' } }
        ]
      };
      // Agar search me sirf number hai toh Serial Number se bhi dhundo
      if (!isNaN(search)) {
        whereClause.OR.push({ serialNumber: parseInt(search) });
      }
    }

    // Saare customers unke orders aur payments ke sath mangwao
    const customers = await prisma.customer.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        orders: {
          include: { items: true, payments: true }
        }
      }
    });

    // Har customer ki udhaari (Pending Payment) nikalna
    const processedCustomers = customers.map(c => {
      let totalPending = 0;
      c.orders.forEach(order => {
        const orderTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const orderPaid = order.payments.reduce((sum, pay) => sum + pay.installmentAmount, 0);
        totalPending += (orderTotal - orderPaid);
      });

      // Frontend ko clean data bhejna
      return {
        id: c.id,
        serialNumber: c.serialNumber,
        customerCode: c.customerCode,
        name: c.name,
        mobile: c.mobile,
        address: c.address,
        createdAt: c.createdAt,
        totalPending: totalPending
      };
    });

    res.status(200).json({ success: true, count: processedCustomers.length, data: processedCustomers });
  } catch (error) {
    next(error);
  }
};

// 3. Ek Customer Ki Poori Details (Naap aur Orders ke sath)
const getCustomerById = async (req, res, next) => {
  try {
    const customerId = req.params.id;
    const shopId = req.shopId;

    const customer = await prisma.customer.findFirst({
      where: { id: customerId, shopId }, 
      include: {
        measurements: { orderBy: { createdAt: 'desc' } }, 
        orders: {
          orderBy: { createdAt: 'desc' },
          include: { items: true, payments: true }
        }
      }
    });

    if (!customer) return res.status(404).json({ success: false, message: "Customer nahi mila!" });

    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

// 4. Update Customer (Pehle wala hi rahega)
const updateCustomer = async (req, res, next) => {
  // ... purana update code waisa hi rahega ...
  try {
    const customerId = req.params.id;
    const shopId = req.shopId;
    const { name, mobile, address, notes } = req.body;

    const existingCustomer = await prisma.customer.findFirst({ where: { id: customerId, shopId } });
    if (!existingCustomer) return res.status(404).json({ success: false, message: "Customer nahi mila." });

    const updatedCustomer = await prisma.customer.update({
      where: { id: customerId },
      data: { name, mobile, address, notes }
    });

    res.status(200).json({ success: true, message: "Details update ho gayi hain.", data: updatedCustomer });
  } catch (error) {
    next(error);
  }
};

module.exports = { addCustomer, getAllCustomers, getCustomerById, updateCustomer };