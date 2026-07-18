const { Op } = require('sequelize');
const { Victim, Crime } = require('../models');

// @desc    Create a victim profile linked to a case
// @route   POST /api/victims
// @access  Private (Officer, Admin)
exports.createVictim = async (req, res) => {
  try {
    const { name, contact, statement, evidenceReference, linkedCrime } = req.body;

    if (contact) {
      const phoneRegex = /^[789]\d{9}$/;
      if (!phoneRegex.test(contact)) {
        return res.status(400).json({
          success: false,
          message: 'Contact phone number must be 10 digits starting with 7, 8, or 9.',
        });
      }
    }

    // Verify linked crime case exists
    const crimeExists = await Crime.findByPk(linkedCrime);
    if (!crimeExists) {
      return res.status(404).json({ success: false, message: 'Linked crime case not found' });
    }

    const victim = await Victim.create({
      name,
      contact,
      statement,
      evidenceReference: evidenceReference || '',
      linkedCrimeId: linkedCrime,
    });

    res.status(201).json({ success: true, victim });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all victims (with filters)
// @route   GET /api/victims
// @access  Private (Officer, Analyst, Admin)
exports.getVictims = async (req, res) => {
  try {
    const { name, linkedCrime } = req.query;
    const where = {};

    if (name) where.name = { [Op.like]: `%${name}%` };
    if (linkedCrime) where.linkedCrimeId = linkedCrime;

    const victims = await Victim.findAll({
      where,
      include: [{ model: Crime, as: 'linkedCrime' }],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({ success: true, count: victims.length, victims });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get victim by ID
// @route   GET /api/victims/:id
// @access  Private (Officer, Analyst, Admin)
exports.getVictimById = async (req, res) => {
  try {
    const victim = await Victim.findByPk(req.params.id, {
      include: [{ model: Crime, as: 'linkedCrime' }],
    });
    if (!victim) {
      return res.status(404).json({ success: false, message: 'Victim record not found' });
    }
    res.status(200).json({ success: true, victim });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update a victim profile
// @route   PUT /api/victims/:id
// @access  Private (Officer, Admin)
exports.updateVictim = async (req, res) => {
  try {
    const { name, contact, statement, evidenceReference, linkedCrime } = req.body;
    const victim = await Victim.findByPk(req.params.id);

    if (!victim) {
      return res.status(404).json({ success: false, message: 'Victim record not found' });
    }

    if (name) victim.name = name;
    if (contact) victim.contact = contact;
    if (statement) victim.statement = statement;
    if (evidenceReference !== undefined) victim.evidenceReference = evidenceReference;
    if (linkedCrime) {
      const crimeExists = await Crime.findByPk(linkedCrime);
      if (!crimeExists) {
        return res.status(404).json({ success: false, message: 'Linked crime case not found' });
      }
      victim.linkedCrimeId = linkedCrime;
    }

    await victim.save();
    res.status(200).json({ success: true, victim });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete a victim profile
// @route   DELETE /api/victims/:id
// @access  Private (Officer, Admin)
exports.deleteVictim = async (req, res) => {
  try {
    const victim = await Victim.findByPk(req.params.id);
    if (!victim) {
      return res.status(404).json({ success: false, message: 'Victim record not found' });
    }
    await victim.destroy();
    res.status(200).json({ success: true, message: 'Victim record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
