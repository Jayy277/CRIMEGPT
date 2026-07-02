const Suspect = require('../models/Suspect');
const Crime = require('../models/Crime');

// Helper function to link suspect previous cases bidirectionally
const syncSuspectCases = async (suspectName) => {
  try {
    // Find all suspects with the exact name (case-insensitive)
    const matches = await Suspect.find({
      name: { $regex: new RegExp(`^${suspectName}$`, 'i') },
    });

    if (matches.length <= 1) return; // No other matching suspects

    // Collect all unique crimes associated with this suspect name
    const allCrimeIds = [...new Set(matches.map(m => String(m.linkedCrime)))];

    // Update each suspect record to contain all other crime IDs in previousCases
    for (const match of matches) {
      const otherCrimes = allCrimeIds.filter(id => id !== String(match.linkedCrime));
      match.previousCases = otherCrimes;
      await match.save();
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
    const crimeExists = await Crime.findById(linkedCrime);
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
      linkedCrime,
      previousCases: [],
    });

    // Run sync to update previousCases lists for suspects with this name
    await syncSuspectCases(name);

    // Fetch the updated suspect profile
    const updatedSuspect = await Suspect.findById(suspect._id).populate('previousCases').populate('linkedCrime');

    res.status(201).json({ success: true, suspect: updatedSuspect });
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
    const filter = {};

    if (name) filter.name = { $regex: name, $options: 'i' };
    if (status) filter.status = status;
    if (linkedCrime) filter.linkedCrime = linkedCrime;

    const suspects = await Suspect.find(filter)
      .populate('linkedCrime')
      .populate('previousCases')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: suspects.length, suspects });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get suspect by ID
// @route   GET /api/suspects/:id
// @access  Private (Officer, Analyst, Admin)
exports.getSuspectById = async (req, res) => {
  try {
    const suspect = await Suspect.findById(req.params.id)
      .populate('linkedCrime')
      .populate('previousCases');

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
    const suspect = await Suspect.findById(req.params.id);

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
      const crimeExists = await Crime.findById(linkedCrime);
      if (!crimeExists) {
        return res.status(404).json({ success: false, message: 'Linked crime case not found' });
      }
      suspect.linkedCrime = linkedCrime;
    }

    await suspect.save();

    // If name changed, run sync for both old and new names
    if (name && name.toLowerCase() !== oldName.toLowerCase()) {
      await syncSuspectCases(oldName);
      await syncSuspectCases(name);
    } else {
      // Sync in case linkedCrime changed
      await syncSuspectCases(suspect.name);
    }

    const updatedSuspect = await Suspect.findById(suspect._id).populate('previousCases').populate('linkedCrime');

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
    const suspect = await Suspect.findById(req.params.id);
    if (!suspect) {
      return res.status(404).json({ success: false, message: 'Suspect profile not found' });
    }

    const suspectName = suspect.name;
    await suspect.deleteOne();

    // Re-sync to clean up deleted suspect links
    await syncSuspectCases(suspectName);

    res.status(200).json({ success: true, message: 'Suspect profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
