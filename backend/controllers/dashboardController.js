const mongoose = require('mongoose');
const Crime = require('../models/Crime');
const User = require('../models/User');
const Officer = require('../models/Officer');
const Location = require('../models/Location');
const CrimeCategory = require('../models/CrimeCategory');
const { generateReportPDF } = require('../utils/pdfGenerator');

// @desc    Get Officer Dashboard Stats
// @route   GET /api/dashboard/officer
// @access  Private (Officer, Admin)
exports.getOfficerDashboard = async (req, res) => {
  try {
    // Find officer associated with logged in user
    const officer = await Officer.findOne({ user: req.user._id });
    if (!officer) {
      return res.status(404).json({ success: false, message: 'Officer profile not found' });
    }

    // 1. Assigned cases count
    const totalAssigned = await Crime.countDocuments({ officer: officer._id });

    // 2. Pending investigations count (status !== 'Solved' and status !== 'Closed')
    const pendingCount = await Crime.countDocuments({
      officer: officer._id,
      status: { $nin: ['Solved', 'Closed'] },
    });

    // 3. Solved cases count
    const solvedCount = totalAssigned - pendingCount;

    // 4. Recent reports (latest 5 cases assigned)
    const recentCases = await Crime.find({ officer: officer._id })
      .populate('crimeCategory')
      .populate('location')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalAssigned,
        pendingCount,
        solvedCount,
      },
      recentCases,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get Analyst Dashboard / Aggregated Stats
// @route   GET /api/dashboard/analyst
// @access  Private (Analyst, Admin)
exports.getAnalystDashboard = async (req, res) => {
  try {
    // 1. Total crimes
    const totalCrimes = await Crime.countDocuments();

    // 2. Solved vs Pending
    const solvedCount = await Crime.countDocuments({ status: { $in: ['Solved', 'Closed'] } });
    const pendingCount = totalCrimes - solvedCount;

    // 3. Category distribution (aggregate group by category)
    const categoryStats = await Crime.aggregate([
      {
        $group: {
          _id: '$crimeCategory',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'crimecategories', // mongoose collection name
          localField: '_id',
          foreignField: '_id',
          as: 'categoryDetails',
        },
      },
      { $unwind: '$categoryDetails' },
      {
        $project: {
          _id: 1,
          name: '$categoryDetails.name',
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 4. Hotspot data (aggregate group by location)
    const hotspotStats = await Crime.aggregate([
      {
        $group: {
          _id: '$location',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'locations',
          localField: '_id',
          foreignField: '_id',
          as: 'locationDetails',
        },
      },
      { $unwind: '$locationDetails' },
      {
        $project: {
          _id: 1,
          state: '$locationDetails.state',
          district: '$locationDetails.district',
          city: '$locationDetails.city',
          policeStation: '$locationDetails.policeStation',
          count: 1,
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 }, // Top 10 hotspots
    ]);

    // 5. Monthly trends (aggregate group by year and month)
    const monthlyTrends = await Crime.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }, // Last 12 months
    ]);

    // 6. Peak crime hours (based on 'time' field HH:MM)
    // Extract hour from HH:MM string and aggregate
    const hourStats = await Crime.aggregate([
      {
        $project: {
          hour: {
            $arrayElemAt: [{ $split: ['$time', ':'] }, 0],
          },
        },
      },
      {
        $group: {
          _id: '$hour',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 }, // Top 5 peak hours
    ]);

    res.status(200).json({
      success: true,
      summary: {
        totalCrimes,
        solvedCount,
        pendingCount,
        solvedRate: totalCrimes > 0 ? ((solvedCount / totalCrimes) * 100).toFixed(2) + '%' : '0%',
      },
      categoryStats,
      hotspotStats,
      monthlyTrends,
      hourStats,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get Admin Dashboard Stats
// @route   GET /api/dashboard/admin
// @access  Private (Admin)
exports.getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    
    // Active officers count
    const activeOfficers = await Officer.countDocuments({
      user: { $in: await User.find({ role: 'officer', isActive: true }).distinct('_id') }
    });

    const activeCases = await Crime.countDocuments({ status: { $nin: ['Solved', 'Closed'] } });
    const solvedCases = await Crime.countDocuments({ status: { $in: ['Solved', 'Closed'] } });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        activeOfficers,
        activeCases,
        solvedCases,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Generate Reports (JSON or PDF)
// @route   GET /api/dashboard/report
// @access  Private (Officer, Analyst, Admin)
exports.getReport = async (req, res) => {
  try {
    const { startDate, endDate, format, priority, status } = req.query;

    const filter = {};

    // Date range filters
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate + 'T23:59:59.999Z');
    }

    if (priority) filter.priority = priority;
    if (status) filter.status = status;

    // Retrieve matching cases
    const crimes = await Crime.find(filter)
      .populate('crimeCategory')
      .populate('location')
      .sort({ date: -1 });

    const periodStr = (startDate || 'Beginning') + ' to ' + (endDate || 'Present');

    // Return PDF
    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=CrimeGPT-Report-${Date.now()}.pdf`);
      
      return generateReportPDF(
        res,
        'Crime Cases Compilation Report',
        `Generated from filter criteria. Total cases matched: ${crimes.length}`,
        crimes,
        periodStr
      );
    }

    // Return JSON (default)
    res.status(200).json({
      success: true,
      period: periodStr,
      count: crimes.length,
      crimes,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
