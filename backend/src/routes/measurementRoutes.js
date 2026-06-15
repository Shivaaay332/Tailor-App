const express = require('express');
const { 
  addMeasurement, 
  getCustomerMeasurements, 
  updateMeasurement, 
  deleteMeasurement 
} = require('../controllers/measurementController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', protect, addMeasurement);
router.get('/customer/:customerId', protect, getCustomerMeasurements);
router.put('/:id', protect, updateMeasurement);
router.delete('/:id', protect, deleteMeasurement);

module.exports = router;