const Victim = require('../models/Victim');
const Crime = require('../models/Crime');

// @desc    Create a victim profile linked to a case
// @route   POST /api/victims
// @access  Private (Officer, Admin)
exports.createVictim = async (req, res) => {
  try {
    const { name, contact, statement, evidenceReference, linkedCrime } = req.body;

    // Verify linked crime case exists
    const crimeExists = await Crime.findById(linkedCrime);
    if (!crimeExists) {
      return res.status(404).json({ success: false, message: 'Linked crime case not found' });
    }

    const victim = await Victim.create({
      name,
      contact,
      statement,
      evidenceReference: evidenceReference || '',
      linkedCrime,
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
    const filter = {};

    if (name) filter.name = { $regex: name, $options: 'i' };
    if (linkedCrime) filter.linkedCrime = linkedCrime;

    const victims = await Victim.find(filter)
      .populate('linkedCrime')
      .sort({ createdAt: -1 });

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
    const victim = await Victim.findById(req.params.id).populate('linkedCrime');
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
    const victim = await Victim.findById(req.params.id);

    if (!victim) {
      return res.status(404).json({ success: false, message: 'Victim record not found' });
    }

    if (name) victim.name = name;
    if (contact) victim.contact = contact;
    if (statement) victim.statement = statement;
    if (evidenceReference !== undefined) victim.evidenceReference = evidenceReference;
    if (linkedCrime) {
      const crimeExists = await Crime.findById(linkedCrime);
      if (!crimeExists) {
        return res.status(404).json({ success: false, message: 'Linked crime case not found' });
      }
      victim.linkedCrime = linkedCrime;
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
    const victim = await Victim.findById(req.params.id);
    if (!victim) {
      return res.status(404).json({ success: false, message: 'Victim record not found' });
    }
    await victim.deleteOne();
    res.status(200).json({ success: true, message: 'Victim record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
