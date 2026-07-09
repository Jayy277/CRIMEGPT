const Crime = require('../models/Crime');
const User = require('../models/User');
const Officer = require('../models/Officer');
const Location = require('../models/Location');
const Suspect = require('../models/Suspect');
const Notification = require('../models/Notification');
const CrimeCategory = require('../models/CrimeCategory');

// Status Progression Order
const STATUS_ORDER = ['Reported', 'Assigned', 'Under Investigation', 'Evidence Collected', 'Solved', 'Closed'];

// Helper to create notifications
const createNotification = async (type, recipient, message) => {
  try {
    await Notification.create({ type, recipient, message });
  } catch (error) {
    console.error('Failed to create notification:', error.message);
  }
};

// @desc    Register a new crime case
// @route   POST /api/crimes
// @access  Private (Officer, Admin)
exports.registerCrime = async (req, res) => {
  try {
    const { crimeCategory, date, time, location, description, officer, priority, sections } = req.body;

    // Verify officer exists
    const officerExists = await Officer.findById(officer).populate('user');
    if (!officerExists) {
      return res.status(404).json({ success: false, message: 'Officer not found' });
    }

    // Verify location exists
    const locationExists = await Location.findById(location);
    if (!locationExists) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }

    // Create crime case
    const crime = await Crime.create({
      crimeCategory,
      date,
      time,
      location,
      description,
      officer,
      priority: priority || 'Medium',
      sections: sections || [],
      status: 'Reported',
      notes: [],
    });

    // 1. Notify Assigned Officer (New Case Assigned)
    await createNotification(
      'New Case Assigned',
      officerExists.user._id,
      `You have been assigned to Case: ${crime.crimeId} (${description.substring(0, 40)}...)`
    );

    // 2. Notify Admins and Assigned Officer if High/Critical Priority
    if (priority === 'High' || priority === 'Critical') {
      const admins = await User.find({ role: 'admin' });
      const adminPromises = admins.map(admin =>
        createNotification(
          'High Priority Alert',
          admin._id,
          `High Priority Case Created: ${crime.crimeId} assigned to officer ${officerExists.badgeNo}`
        )
      );
      await Promise.all(adminPromises);
    }

    res.status(201).json({ success: true, crime });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all crimes (with search, filters)
// @route   GET /api/crimes
// @access  Private (Officer, Analyst, Admin)
exports.getCrimes = async (req, res) => {
  try {
    const { crimeId, crimeCategory, location, priority, status, suspectName, search } = req.query;
    const filter = {};

    // Exact matching filters
    if (crimeId) filter.crimeId = { $regex: crimeId, $options: 'i' };
    if (crimeCategory) filter.crimeCategory = crimeCategory;
    if (location) filter.location = location;
    if (priority) filter.priority = priority;
    if (status) filter.status = status;

    // Search query matches description
    if (search) {
      filter.description = { $regex: search, $options: 'i' };
    }

    // Suspect name filtering
    if (suspectName) {
      // Find suspects with matching name
      const matchingSuspects = await Suspect.find({
        name: { $regex: suspectName, $options: 'i' },
      });
      const crimeIds = matchingSuspects.map(s => s.linkedCrime);
      filter._id = { $in: crimeIds };
    }

    // Role-based scoping for officers: officers can see all, but let's allow general lists
    // If logged-in user is an officer, and we want to view only their assigned cases:
    if (req.user.role === 'officer' && req.query.assignedOnly === 'true') {
      const officer = await Officer.findOne({ user: req.user._id });
      if (officer) {
        filter.officer = officer._id;
      }
    }

    const crimes = await Crime.find(filter)
      .populate('crimeCategory')
      .populate('location')
      .populate({
        path: 'officer',
        populate: { path: 'user', select: 'name email' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: crimes.length, crimes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get pending cases (Custom Feature B)
// @route   GET /api/crimes/pending
// @access  Private (Officer, Analyst, Admin)
exports.getPendingCrimes = async (req, res) => {
  try {
    // Pending means status is not 'Solved' and not 'Closed'
    const pendingCrimes = await Crime.find({
      status: { $nin: ['Solved', 'Closed'] },
    })
      .populate('crimeCategory')
      .populate('location')
      .populate({
        path: 'officer',
        populate: { path: 'user', select: 'name email' },
      })
      .sort({ createdAt: -1 });

    // Every crime document will include the virtual `isPending` (which is true)
    res.status(200).json({
      success: true,
      count: pendingCrimes.length,
      crimes: pendingCrimes,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get crime by ID
// @route   GET /api/crimes/:id
// @access  Private (Officer, Analyst, Admin)
exports.getCrimeById = async (req, res) => {
  try {
    const crime = await Crime.findById(req.params.id)
      .populate('crimeCategory')
      .populate('location')
      .populate({
        path: 'officer',
        populate: { path: 'user', select: 'name email' },
      })
      .populate('notes.addedBy', 'name email role');

    if (!crime) {
      return res.status(404).json({ success: false, message: 'Crime case not found' });
    }

    res.status(200).json({ success: true, crime });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update crime details (excluding status flow)
// @route   PUT /api/crimes/:id
// @access  Private (Officer, Admin)
exports.updateCrime = async (req, res) => {
  try {
    const { crimeCategory, date, time, location, description, officer, priority, sections } = req.body;
    const crime = await Crime.findById(req.params.id);

    if (!crime) {
      return res.status(404).json({ success: false, message: 'Crime case not found' });
    }

    // Verify user authorization: officers can only edit their own cases
    if (req.user.role === 'officer') {
      const officerRecord = await Officer.findOne({ user: req.user._id });
      if (!officerRecord || String(crime.officer) !== String(officerRecord._id)) {
        return res.status(403).json({ success: false, message: 'Unauthorized. You can only edit cases assigned to you.' });
      }
    }

    if (crimeCategory) crime.crimeCategory = crimeCategory;
    if (date) crime.date = date;
    if (time) crime.time = time;
    if (location) crime.location = location;
    if (description) crime.description = description;
    if (officer) {
      const officerExists = await Officer.findById(officer);
      if (!officerExists) {
        return res.status(404).json({ success: false, message: 'New assigned officer not found' });
      }
      // Trigger notification if officer changed
      if (String(crime.officer) !== String(officer)) {
        const oldOfficer = await Officer.findById(crime.officer).populate('user');
        if (oldOfficer) {
          await createNotification('New Case Assigned', oldOfficer.user._id, `You have been unassigned from Case: ${crime.crimeId}`);
        }
        crime.officer = officer;
        const newOfficerUser = await Officer.findById(officer).populate('user');
        await createNotification('New Case Assigned', newOfficerUser.user._id, `You have been assigned to Case: ${crime.crimeId}`);
      }
    }
    if (priority) crime.priority = priority;
    if (sections) crime.sections = sections;

    await crime.save();
    res.status(200).json({ success: true, crime });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update crime status strictly following sequential flow
// @route   PATCH /api/crimes/:id/status
// @access  Private (Officer, Admin)
exports.updateCrimeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const crime = await Crime.findById(req.params.id);

    if (!crime) {
      return res.status(404).json({ success: false, message: 'Crime case not found' });
    }

    // Verify authorization
    if (req.user.role === 'officer') {
      const officerRecord = await Officer.findOne({ user: req.user._id });
      if (!officerRecord || String(crime.officer) !== String(officerRecord._id)) {
        return res.status(403).json({ success: false, message: 'Unauthorized. You can only update status for your assigned cases.' });
      }
    }

    // Status progression flow validation
    const currentIndex = STATUS_ORDER.indexOf(crime.status);
    const targetIndex = STATUS_ORDER.indexOf(status);

    if (targetIndex === -1) {
      return res.status(400).json({ success: false, message: `Invalid status. Choose from: ${STATUS_ORDER.join(', ')}` });
    }

    // Enforce sequence: can stay same, or must move to the exact next status
    if (targetIndex !== currentIndex && targetIndex !== currentIndex + 1) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from '${crime.status}' to '${status}'. Status must strictly follow the progression flow: ${STATUS_ORDER.join(' → ')}`,
      });
    }

    crime.status = status;
    await crime.save();

    // Notify assigned officer of the status progression
    const officerRecord = await Officer.findById(crime.officer).populate('user');
    if (officerRecord) {
      await createNotification(
        'New Case Assigned', // general category update
        officerRecord.user._id,
        `Status of Case ${crime.crimeId} updated to: ${status}`
      );
    }

    res.status(200).json({ success: true, status: crime.status, isPending: crime.isPending, crime });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Close or mark crime as Solved/Closed directly
// @route   PATCH /api/crimes/:id/close-solved
// @access  Private (Officer, Admin)
exports.closeOrSolveCrime = async (req, res) => {
  try {
    const { status } = req.body; // 'Solved' or 'Closed'
    const crime = await Crime.findById(req.params.id);

    if (!crime) {
      return res.status(404).json({ success: false, message: 'Crime case not found' });
    }

    if (!['Solved', 'Closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be either Solved or Closed' });
    }

    // Verify authorization
    if (req.user.role === 'officer') {
      const officerRecord = await Officer.findOne({ user: req.user._id });
      if (!officerRecord || String(crime.officer) !== String(officerRecord._id)) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }
    }

    crime.status = status;
    await crime.save();

    res.status(200).json({ success: true, message: `Case successfully marked as ${status}`, crime });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Add notes / timeline updates to a case
// @route   POST /api/crimes/:id/notes
// @access  Private (Officer, Analyst, Admin)
exports.addCrimeNote = async (req, res) => {
  try {
    const { note } = req.body;
    if (!note) {
      return res.status(400).json({ success: false, message: 'Note content is required' });
    }

    const crime = await Crime.findById(req.params.id);
    if (!crime) {
      return res.status(404).json({ success: false, message: 'Crime case not found' });
    }

    crime.notes.push({
      note,
      addedBy: req.user._id,
      createdAt: new Date(),
    });

    await crime.save();
    res.status(200).json({ success: true, notes: crime.notes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete a crime (Admin-only)
// @route   DELETE /api/crimes/:id
// @access  Private (Admin)
exports.deleteCrime = async (req, res) => {
  try {
    const crime = await Crime.findById(req.params.id);
    if (!crime) {
      return res.status(404).json({ success: false, message: 'Crime case not found' });
    }
    await crime.deleteOne();
    res.status(200).json({ success: true, message: 'Crime case deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Custom Feature C: Find similar/related past cases
// @route   GET /api/crimes/:id/similar
// @access  Private (Officer, Analyst, Admin)
exports.findSimilarCrimes = async (req, res) => {
  try {
    const sourceCrime = await Crime.findById(req.params.id)
      .populate('crimeCategory')
      .populate('location');

    if (!sourceCrime) {
      return res.status(404).json({ success: false, message: 'Source crime case not found' });
    }

    // Fetch all other crimes (excluding source itself)
    const otherCrimes = await Crime.find({ _id: { $ne: sourceCrime._id } })
      .populate('crimeCategory')
      .populate('location');

    // Parse description of source into keywords to match
    // Filter out simple stopwords to improve keyword search relevance
    const stopWords = new Set(['the', 'and', 'a', 'of', 'in', 'on', 'at', 'with', 'for', 'by', 'an', 'to', 'was', 'were', 'had', 'been', 'is', 'are']);
    const sourceKeywords = sourceCrime.description
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // remove punctuation
      .split(/\s+/)
      .filter(w => w.length > 3 && !stopWords.has(w));

    const rankedCases = otherCrimes.map(targetCrime => {
      let score = 0;
      const reasons = [];

      // 1. Match Crime Category (Weight: 5)
      if (String(targetCrime.crimeCategory._id) === String(sourceCrime.crimeCategory._id)) {
        score += 5;
        reasons.push(`Same crime type (${sourceCrime.crimeCategory.name})`);
      }

      // 2. Match Location:
      // Station level (Weight: 4)
      if (
        targetCrime.location.policeStation.toLowerCase() === sourceCrime.location.policeStation.toLowerCase() &&
        targetCrime.location.city.toLowerCase() === sourceCrime.location.city.toLowerCase()
      ) {
        score += 4;
        reasons.push(`Same police station jurisdiction (${sourceCrime.location.policeStation})`);
      } 
      // City level (Weight: 3)
      else if (targetCrime.location.city.toLowerCase() === sourceCrime.location.city.toLowerCase()) {
        score += 3;
        reasons.push(`Same city (${sourceCrime.location.city})`);
      } 
      // District level (Weight: 2)
      else if (targetCrime.location.district.toLowerCase() === sourceCrime.location.district.toLowerCase()) {
        score += 2;
        reasons.push(`Same district (${sourceCrime.location.district})`);
      }

      // 3. Proximity of Dates (Weight: 3 for 30 days, 1 for 90 days)
      const daysDiff = Math.abs((new Date(targetCrime.date) - new Date(sourceCrime.date)) / (1000 * 60 * 60 * 24));
      if (daysDiff <= 30) {
        score += 3;
        reasons.push(`Date proximity within 30 days (${Math.round(daysDiff)} days apart)`);
      } else if (daysDiff <= 90) {
        score += 1;
        reasons.push(`Date proximity within 90 days (${Math.round(daysDiff)} days apart)`);
      }

      // 4. Description Keyword Match (Weight: 1 per matched keyword, max 4)
      const targetDescLower = targetCrime.description.toLowerCase();
      let matchedWordCount = 0;
      const matchedWords = [];

      for (const word of sourceKeywords) {
        if (targetDescLower.includes(word)) {
          matchedWordCount++;
          matchedWords.push(word);
          if (matchedWordCount <= 4) {
            score += 1;
          }
        }
      }

      if (matchedWordCount > 0) {
        reasons.push(`Similar details matching keywords: ${matchedWords.slice(0, 3).join(', ')}${matchedWords.length > 3 ? '...' : ''}`);
      }

      return {
        crime: targetCrime,
        similarityScore: score,
        similarityReasons: reasons,
      };
    })
    .filter(item => item.similarityScore > 0) // only return items with positive similarity score
    .sort((a, b) => b.similarityScore - a.similarityScore) // sort descending
    .slice(0, 10); // return top 10 matches

    res.status(200).json({
      success: true,
      count: rankedCases.length,
      results: rankedCases,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
