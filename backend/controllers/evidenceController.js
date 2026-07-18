const { Op } = require('sequelize');
const { Evidence, Crime, Officer, User } = require('../models');

// @desc    Create an evidence record (optional file upload structure)
// @route   POST /api/evidence
// @access  Private (Officer, Admin)
exports.createEvidence = async (req, res) => {
  try {
    const { type, description, collectionDate, assignedOfficer, linkedCrime } = req.body;

    // Verify linked crime case exists
    const crimeExists = await Crime.findByPk(linkedCrime);
    if (!crimeExists) {
      return res.status(404).json({ success: false, message: 'Linked crime case not found' });
    }

    // Verify officer exists
    const officerExists = await Officer.findByPk(assignedOfficer);
    if (!officerExists) {
      return res.status(404).json({ success: false, message: 'Assigned officer not found' });
    }

    let filePath = '';
    if (req.file) {
      filePath = `/uploads/${req.file.filename}`;
    }

    const evidence = await Evidence.create({
      type,
      description,
      collectionDate: collectionDate || new Date(),
      assignedOfficerId: assignedOfficer,
      linkedCrimeId: linkedCrime,
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
    const { type, linkedCrime, assignedOfficer } = req.query;
    const where = {};

    if (type) where.type = { [Op.like]: `%${type}%` };
    if (linkedCrime) where.linkedCrimeId = linkedCrime;
    if (assignedOfficer) where.assignedOfficerId = assignedOfficer;

    const evidence = await Evidence.findAll({
      where,
      include: [
        { model: Crime, as: 'linkedCrime' },
        {
          model: Officer,
          as: 'assignedOfficer',
          include: [{ model: User, attributes: ['name', 'email'] }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({ success: true, count: evidence.length, evidence });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single evidence by ID
// @route   GET /api/evidence/:id
// @access  Private (Officer, Analyst, Admin)
exports.getEvidenceById = async (req, res) => {
  try {
    const evidence = await Evidence.findByPk(req.params.id, {
      include: [
        { model: Crime, as: 'linkedCrime' },
        {
          model: Officer,
          as: 'assignedOfficer',
          include: [{ model: User, attributes: ['name', 'email'] }],
        },
      ],
    });

    if (!evidence) {
      return res.status(404).json({ success: false, message: 'Evidence record not found' });
    }

    res.status(200).json({ success: true, evidence });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update an evidence record
// @route   PUT /api/evidence/:id
// @access  Private (Officer, Admin)
exports.updateEvidence = async (req, res) => {
  try {
    const { type, description, collectionDate, assignedOfficer, linkedCrime } = req.body;
    const evidence = await Evidence.findByPk(req.params.id);

    if (!evidence) {
      return res.status(404).json({ success: false, message: 'Evidence record not found' });
    }

    if (type) evidence.type = type;
    if (description) evidence.description = description;
    if (collectionDate) evidence.collectionDate = collectionDate;

    if (assignedOfficer) {
      const officerExists = await Officer.findByPk(assignedOfficer);
      if (!officerExists) {
        return res.status(404).json({ success: false, message: 'Assigned officer not found' });
      }
      evidence.assignedOfficerId = assignedOfficer;
    }

    if (linkedCrime) {
      const crimeExists = await Crime.findByPk(linkedCrime);
      if (!crimeExists) {
        return res.status(404).json({ success: false, message: 'Linked crime case not found' });
      }
      evidence.linkedCrimeId = linkedCrime;
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
    const evidence = await Evidence.findByPk(req.params.id);
    if (!evidence) {
      return res.status(404).json({ success: false, message: 'Evidence record not found' });
    }
    await evidence.destroy();
    res.status(200).json({ success: true, message: 'Evidence record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
