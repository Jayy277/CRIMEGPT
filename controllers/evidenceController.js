const Evidence = require('../models/Evidence');
const Crime = require('../models/Crime');
const Officer = require('../models/Officer');

// @desc    Create an evidence record (optional file upload structure)
// @route   POST /api/evidence
// @access  Private (Officer, Admin)
exports.createEvidence = async (req, res) => {
  try {
    const { type, description, collectionDate, assignedOfficer, linkedCrime } = req.body;

    // Verify linked crime case exists
    const crimeExists = await Crime.findById(linkedCrime);
    if (!crimeExists) {
      return res.status(404).json({ success: false, message: 'Linked crime case not found' });
    }

    // Verify officer exists
    const officerExists = await Officer.findById(assignedOfficer);
    if (!officerExists) {
      return res.status(404).json({ success: false, message: 'Assigned officer not found' });
    }

    // File path from Multer (if upload was used)
    let filePath = '';
    if (req.file) {
      filePath = `/uploads/${req.file.filename}`;
    }

    const evidence = await Evidence.create({
      type,
      description,
      collectionDate: collectionDate || new Date(),
      assignedOfficer,
      linkedCrime,
      filePath,
    });

    res.status(201).json({ success: true, evidence });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all evidence records (with filters)
// @route   GET /api/evidence
// @access  Private (Officer, Analyst, Admin)
exports.getEvidence = async (req, res) => {
  try {
    const { type, assignedOfficer, linkedCrime } = req.query;
    const filter = {};

    if (type) filter.type = { $regex: type, $options: 'i' };
    if (assignedOfficer) filter.assignedOfficer = assignedOfficer;
    if (linkedCrime) filter.linkedCrime = linkedCrime;

    const evidenceList = await Evidence.find(filter)
      .populate('linkedCrime')
      .populate({
        path: 'assignedOfficer',
        populate: { path: 'user', select: 'name email' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: evidenceList.length, evidence: evidenceList });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get evidence record by ID
// @route   GET /api/evidence/:id
// @access  Private (Officer, Analyst, Admin)
exports.getEvidenceById = async (req, res) => {
  try {
    const evidence = await Evidence.findById(req.params.id)
      .populate('linkedCrime')
      .populate({
        path: 'assignedOfficer',
        populate: { path: 'user', select: 'name email' },
      });

    if (!evidence) {
      return res.status(404).json({ success: false, message: 'Evidence record not found' });
    }

    res.status(200).json({ success: true, evidence });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update an evidence record (optional file upload structure)
// @route   PUT /api/evidence/:id
// @access  Private (Officer, Admin)
exports.updateEvidence = async (req, res) => {
  try {
    const { type, description, collectionDate, assignedOfficer, linkedCrime } = req.body;
    const evidence = await Evidence.findById(req.params.id);

    if (!evidence) {
      return res.status(404).json({ success: false, message: 'Evidence record not found' });
    }

    if (type) evidence.type = type;
    if (description) evidence.description = description;
    if (collectionDate) evidence.collectionDate = collectionDate;
    
    if (assignedOfficer) {
      const officerExists = await Officer.findById(assignedOfficer);
      if (!officerExists) {
        return res.status(404).json({ success: false, message: 'Assigned officer not found' });
      }
      evidence.assignedOfficer = assignedOfficer;
    }

    if (linkedCrime) {
      const crimeExists = await Crime.findById(linkedCrime);
      if (!crimeExists) {
        return res.status(404).json({ success: false, message: 'Linked crime case not found' });
      }
      evidence.linkedCrime = linkedCrime;
    }

    if (req.file) {
      evidence.filePath = `/uploads/${req.file.filename}`;
    }

    await evidence.save();
    res.status(200).json({ success: true, evidence });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete an evidence record
// @route   DELETE /api/evidence/:id
// @access  Private (Officer, Admin)
exports.deleteEvidence = async (req, res) => {
  try {
    const evidence = await Evidence.findById(req.params.id);
    if (!evidence) {
      return res.status(404).json({ success: false, message: 'Evidence record not found' });
    }
    await evidence.deleteOne();
    res.status(200).json({ success: true, message: 'Evidence record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
