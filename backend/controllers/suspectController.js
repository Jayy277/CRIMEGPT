const { Op } = require('sequelize');
const { Suspect, SuspectPreviousCase, Crime } = require('../models');

// Helper function to link suspect previous cases bidirectionally in MySQL
const syncSuspectCases = async (suspectName) => {
  try {
    // Find all suspects with the exact name (case-insensitive)
    const matches = await Suspect.findAll({
      where: {
        name: { [Op.like]: suspectName },
      },
    });

    if (matches.length <= 1) return;

    const allCrimeIds = [...new Set(matches.map(m => m.linkedCrimeId))];

    // Clear old associations in join table for these suspects
    const suspectIds = matches.map(m => m.id);
    await SuspectPreviousCase.destroy({
      where: { suspectId: { [Op.in]: suspectIds } },
    });

    // Write new associations
    for (const match of matches) {
      const otherCrimes = allCrimeIds.filter(id => id !== match.linkedCrimeId);
      for (const crimeId of otherCrimes) {
        await SuspectPreviousCase.create({
          suspectId: match.id,
          crimeId,
        });
      }
    }
  } catch (error) {
    console.error('Error syncing suspect cases:', error.message);
  }
};

// @desc    Create a suspect profile linked to a case
// @route   POST /api/suspects
// @access  Private (Officer, Admin)
exports.createSuspect = async (req, res) => {
  try {
    const { name, age, gender, address, photoPath, status, linkedCrime } = req.body;

    // Verify linked crime case exists
    const crimeExists = await Crime.findByPk(linkedCrime);
    if (!crimeExists) {
      return res.status(404).json({ success: false, message: 'Linked crime case not found' });
    }

    const suspect = await Suspect.create({
      name,
      age,
      gender,
      address,
      photoPath: photoPath || '',
      status: status || 'Suspect',
      linkedCrimeId: linkedCrime,
    });

    // Run bidirectional cases syncing
    await syncSuspectCases(name);

    res.status(201).json({ success: true, suspect });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all suspects (with filters)
// @route   GET /api/suspects
// @access  Private (Officer, Analyst, Admin)
exports.getSuspects = async (req, res) => {
  try {
    const { name, status, linkedCrime } = req.query;
    const where = {};

    if (name) where.name = { [Op.like]: `%${name}%` };
    if (status) where.status = status;
    if (linkedCrime) where.linkedCrimeId = linkedCrime;

    const suspects = await Suspect.findAll({
      where,
      include: [
        { model: Crime, as: 'linkedCrime' },
        { model: Crime, as: 'previousCases', through: { attributes: [] } },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({ success: true, count: suspects.length, suspects });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single suspect by ID
// @route   GET /api/suspects/:id
// @access  Private (Officer, Analyst, Admin)
exports.getSuspectById = async (req, res) => {
  try {
    const suspect = await Suspect.findByPk(req.params.id, {
      include: [
        { model: Crime, as: 'linkedCrime' },
        { model: Crime, as: 'previousCases', through: { attributes: [] } },
      ],
    });

    if (!suspect) {
      return res.status(404).json({ success: false, message: 'Suspect profile not found' });
    }

    res.status(200).json({ success: true, suspect });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update a suspect profile
// @route   PUT /api/suspects/:id
// @access  Private (Officer, Admin)
exports.updateSuspect = async (req, res) => {
  try {
    const { name, age, gender, address, photoPath, status, linkedCrime } = req.body;
    const suspect = await Suspect.findByPk(req.params.id);

    if (!suspect) {
      return res.status(404).json({ success: false, message: 'Suspect profile not found' });
    }

    const oldName = suspect.name;

    if (name) suspect.name = name;
    if (age !== undefined) suspect.age = age;
    if (gender) suspect.gender = gender;
    if (address) suspect.address = address;
    if (photoPath !== undefined) suspect.photoPath = photoPath;
    if (status) suspect.status = status;
    if (linkedCrime) {
      const crimeExists = await Crime.findByPk(linkedCrime);
      if (!crimeExists) {
        return res.status(404).json({ success: false, message: 'Linked crime case not found' });
      }
      suspect.linkedCrimeId = linkedCrime;
    }

    await suspect.save();

    // If name changed, run sync for both old and new names
    if (name && name.toLowerCase() !== oldName.toLowerCase()) {
      await syncSuspectCases(oldName);
      await syncSuspectCases(name);
    } else {
      await syncSuspectCases(suspect.name);
    }

    const updatedSuspect = await Suspect.findByPk(suspect.id, {
      include: [
        { model: Crime, as: 'linkedCrime' },
        { model: Crime, as: 'previousCases', through: { attributes: [] } },
      ],
    });

    res.status(200).json({ success: true, suspect: updatedSuspect });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete a suspect profile
// @route   DELETE /api/suspects/:id
// @access  Private (Officer, Admin)
exports.deleteSuspect = async (req, res) => {
  try {
    const suspect = await Suspect.findByPk(req.params.id);
    if (!suspect) {
      return res.status(404).json({ success: false, message: 'Suspect profile not found' });
    }

    const suspectName = suspect.name;
    const suspectId = suspect.id;

    // Delete associations first
    await SuspectPreviousCase.destroy({ where: { suspectId } });
    await suspect.destroy();

    // Re-sync to clean up deleted suspect links
    await syncSuspectCases(suspectName);

    res.status(200).json({ success: true, message: 'Suspect profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
