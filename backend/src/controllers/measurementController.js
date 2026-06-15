const prisma = require('../config/db');

// 1. Naya Measurement Add Karna
const addMeasurement = async (req, res, next) => {
  try {
    const { customerId, title, clothType, data } = req.body;

    // Validation: Check karo ki zaruri details aayi hain ya nahi
    if (!customerId || !title || !clothType || !data) {
      return res.status(400).json({ 
        success: false, 
        message: "Customer ID, title, clothType aur naap (data) zaroori hai." 
      });
    }

    // Pehle check karo ki ye customer database me exist karta bhi hai ya nahi
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer nahi mila!" });
    }

    // Measurement save karna
    // 'data' JSON format me hoga, jaise: { "chest": 40, "waist": 34, "length": 28 }
    const measurement = await prisma.measurement.create({
      data: {
        customerId,
        title,         // e.g., "Slim Fit Office Shirt"
        clothType,     // e.g., "Shirt"
        data           // JSON data
      }
    });

    res.status(201).json({
      success: true,
      message: "Naap successfully save ho gaya!",
      data: measurement
    });

  } catch (error) {
    next(error);
  }
};

// 2. Kisi ek Customer ke saare Measurements lana
const getCustomerMeasurements = async (req, res, next) => {
  try {
    const customerId = req.params.customerId; // URL se customer ID nikalna

    const measurements = await prisma.measurement.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' } // Naya naap sabse upar dikhega
    });

    res.status(200).json({
      success: true,
      count: measurements.length,
      data: measurements
    });

  } catch (error) {
    next(error);
  }
};

// 3. Measurement Update Karna (Agar customer patla ya mota ho gaya)
const updateMeasurement = async (req, res, next) => {
  try {
    const measurementId = req.params.id;
    const { title, clothType, data } = req.body;

    const updatedMeasurement = await prisma.measurement.update({
      where: { id: measurementId },
      data: { title, clothType, data }
    });

    res.status(200).json({
      success: true,
      message: "Naap update kar diya gaya hai.",
      data: updatedMeasurement
    });

  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: "Update karne ke liye measurement nahi mila." });
    }
    next(error);
  }
};

// 4. Measurement Delete Karna (Optional feature, par handy rehta hai)
const deleteMeasurement = async (req, res, next) => {
  try {
    const measurementId = req.params.id;

    await prisma.measurement.delete({
      where: { id: measurementId }
    });

    res.status(200).json({
      success: true,
      message: "Naap delete kar diya gaya hai."
    });

  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: "Delete karne ke liye record nahi mila." });
    }
    next(error);
  }
};

module.exports = {
  addMeasurement,
  getCustomerMeasurements,
  updateMeasurement,
  deleteMeasurement
};