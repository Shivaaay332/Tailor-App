const express = require('express');
const { addPayment, getCustomerLedger } = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', protect, addPayment);
router.get('/ledger/:customerId', protect, getCustomerLedger);

module.exports = router;