const express = require('express');
const {
  getOfficerDashboard,
  getAnalystDashboard,
  getAdminDashboard,
  getReport
} = require('../controllers/dashboardController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/officer', restrictTo('officer', 'admin'), getOfficerDashboard);
router.get('/analyst', restrictTo('analyst', 'admin'), getAnalystDashboard);
router.get('/admin', restrictTo('admin'), getAdminDashboard);
router.get('/report', restrictTo('officer', 'analyst', 'admin'), getReport);

module.exports = router;
