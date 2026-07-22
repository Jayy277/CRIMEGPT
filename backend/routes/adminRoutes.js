const express = require('express');
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategorySections,
  createLocation,
  getLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
  getUsers,
  updateUser,
  toggleUserActive,
  deleteUser,
  searchStaff,
  getAuditLogs,
  getCitizens,
  verifyCitizen,
} = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth protection to all routes below
router.use(protect);

// Allow officers, analysts, and admins to fetch crime categories and sections
router.get('/crime-categories', getCategories);
router.get('/crime-categories/:id', getCategoryById);
router.get('/crime-categories/:id/sections', getCategorySections);

// Allow officers, analysts, and admins to get locations list
router.get('/locations', getLocations);
router.get('/locations/:id', getLocationById);

// Admin-only operations
router.post('/crime-categories', restrictTo('admin'), createCategory);
router.put('/crime-categories/:id', restrictTo('admin'), updateCategory);
router.delete('/crime-categories/:id', restrictTo('admin'), deleteCategory);

router.post('/locations', restrictTo('admin'), createLocation);
router.put('/locations/:id', restrictTo('admin'), updateLocation);
router.delete('/locations/:id', restrictTo('admin'), deleteLocation);

router.get('/users', restrictTo('admin'), getUsers);
router.put('/users/:id', restrictTo('admin'), updateUser);
router.patch('/users/:id/toggle-active', restrictTo('admin'), toggleUserActive);
router.delete('/users/:id', restrictTo('admin'), deleteUser);

router.get('/staff-search', restrictTo('admin'), searchStaff);
router.get('/logs', restrictTo('admin'), getAuditLogs);

// Citizens verification
router.get('/citizens', restrictTo('admin'), getCitizens);
router.post('/citizens/:id/verify', restrictTo('admin'), verifyCitizen);

module.exports = router;
