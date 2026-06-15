const express = require('express');
const { 
  createOrder, 
  getAllOrders, 
  updateOrderStatus 
} = require('../controllers/orderController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Saare routes par 'protect' middleware lagaya hai taaki bina login ke koi access na kar sake
// Aur is middleware se hi hume 'req.shopId' milega

router.post('/', protect, createOrder);                  // Naya order banane ke liye
router.get('/', protect, getAllOrders);                  // Saare orders dekhne ke liye
router.patch('/:id/status', protect, updateOrderStatus); // Order ka status (Pending/Ready) update karne ke liye

module.exports = router;