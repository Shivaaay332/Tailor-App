const express = require('express');
const { getDashboardSummary } = require('../controllers/dashboardController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Route: GET /api/dashboard/summary
// Security: Sirf logged-in owner dekh sakta hai
router.get('/summary', protect, getDashboardSummary);

module.exports = router;