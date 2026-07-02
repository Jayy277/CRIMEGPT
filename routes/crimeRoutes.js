const express = require('express');
const {
  registerCrime,
  getCrimes,
  getPendingCrimes,
  getCrimeById,
  updateCrime,
  updateCrimeStatus,
  closeOrSolveCrime,
  addCrimeNote,
  deleteCrime,
  findSimilarCrimes
} = require('../controllers/crimeController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// General endpoints
router.get('/', restrictTo('officer', 'analyst', 'admin'), getCrimes);
router.post('/', restrictTo('officer', 'admin'), registerCrime);

// CRITICAL: Put '/pending' before '/:id' to avoid route parameter hijacking
router.get('/pending', restrictTo('officer', 'analyst', 'admin'), getPendingCrimes);

// ID-specific endpoints
router.get('/:id', restrictTo('officer', 'analyst', 'admin'), getCrimeById);
router.put('/:id', restrictTo('officer', 'admin'), updateCrime);
router.delete('/:id', restrictTo('admin'), deleteCrime);

router.patch('/:id/status', restrictTo('officer', 'admin'), updateCrimeStatus);
router.patch('/:id/close-solved', restrictTo('officer', 'admin'), closeOrSolveCrime);
router.post('/:id/notes', restrictTo('officer', 'analyst', 'admin'), addCrimeNote);
router.get('/:id/similar', restrictTo('officer', 'analyst', 'admin'), findSimilarCrimes);

module.exports = router;
