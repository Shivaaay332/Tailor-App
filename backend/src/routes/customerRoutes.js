const express = require('express');
const { 
  addCustomer, 
  getAllCustomers, 
  getCustomerById, 
  updateCustomer 
} = require('../controllers/customerController');

// Apne security guard (middleware) ko import karo
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Har route se pehle `protect` laga diya. 
// Iska matlab bina Access Token (Login) ke koi in URLs ko hit nahi kar sakta.

// POST request (Add karna) aur GET request (List nikalna) dono base URL ('/') par hain
router.route('/')
  .post(protect, addCustomer)
  .get(protect, getAllCustomers);

// Specific ID wale routes (Read one, Update)
router.route('/:id')
  .get(protect, getCustomerById)
  .put(protect, updateCustomer);

module.exports = router;