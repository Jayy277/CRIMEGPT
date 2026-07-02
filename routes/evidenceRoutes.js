const express = require('express');
const {
  createEvidence,
  getEvidence,
  getEvidenceById,
  updateEvidence,
  deleteEvidence
} = require('../controllers/evidenceController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

// Allow file upload under parameter name 'file'
router.post('/', restrictTo('officer', 'admin'), upload.single('file'), createEvidence);
router.get('/', restrictTo('officer', 'analyst', 'admin'), getEvidence);
router.get('/:id', restrictTo('officer', 'analyst', 'admin'), getEvidenceById);
router.put('/:id', restrictTo('officer', 'admin'), upload.single('file'), updateEvidence);
router.delete('/:id', restrictTo('officer', 'admin'), deleteEvidence);

module.exports = router;
