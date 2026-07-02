const express = require('express');
const {
  createSuspect,
  getSuspects,
  getSuspectById,
  updateSuspect,
  deleteSuspect
} = require('../controllers/suspectController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', restrictTo('officer', 'admin'), createSuspect);
router.get('/', restrictTo('officer', 'analyst', 'admin'), getSuspects);
router.get('/:id', restrictTo('officer', 'analyst', 'admin'), getSuspectById);
router.put('/:id', restrictTo('officer', 'admin'), updateSuspect);
router.delete('/:id', restrictTo('officer', 'admin'), deleteSuspect);

module.exports = router;
