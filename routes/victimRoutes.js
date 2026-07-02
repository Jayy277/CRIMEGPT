const express = require('express');
const {
  createVictim,
  getVictims,
  getVictimById,
  updateVictim,
  deleteVictim
} = require('../controllers/victimController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', restrictTo('officer', 'admin'), createVictim);
router.get('/', restrictTo('officer', 'analyst', 'admin'), getVictims);
router.get('/:id', restrictTo('officer', 'analyst', 'admin'), getVictimById);
router.put('/:id', restrictTo('officer', 'admin'), updateVictim);
router.delete('/:id', restrictTo('officer', 'admin'), deleteVictim);

module.exports = router;
