const User = require('../models/User');
const Officer = require('../models/Officer');
const Analyst = require('../models/Analyst');
const Location = require('../models/Location');
const CrimeCategory = require('../models/CrimeCategory');
const AuditLog = require('../models/AuditLog');

// ==========================================
// 1. CRIME CATEGORIES MANAGEMENT
// ==========================================

// Create Crime Category
exports.createCategory = async (req, res) => {
  try {
    const { name, sections } = req.body;
    const categoryExists = await CrimeCategory.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }
    const category = await CrimeCategory.create({ name, sections });
    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all Crime Categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await CrimeCategory.find({});
    res.status(200).json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Crime Category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await CrimeCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.status(200).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update Crime Category
exports.updateCategory = async (req, res) => {
  try {
    const { name, sections } = req.body;
    const category = await CrimeCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    if (name) category.name = name;
    if (sections) category.sections = sections;
    await category.save();
    res.status(200).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete Crime Category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await CrimeCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    await category.deleteOne();
    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Custom Feature A: GET legal sections tied to category
// This is exposed under /api/crime-categories/:id/sections and /api/admin/crime-categories/:id/sections
exports.getCategorySections = async (req, res) => {
  try {
    const category = await CrimeCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.status(200).json({ success: true, sections: category.sections });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// ==========================================
// 2. LOCATIONS MANAGEMENT
// ==========================================

// Create Location
exports.createLocation = async (req, res) => {
  try {
    const { state, district, city, policeStation } = req.body;
    
    // Check if duplicate station exists
    const duplicate = await Location.findOne({ state, district, city, policeStation });
    if (duplicate) {
      return res.status(400).json({ success: false, message: 'This location/station already exists' });
    }

    const location = await Location.create({ state, district, city, policeStation });
    res.status(201).json({ success: true, location });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all Locations
exports.getLocations = async (req, res) => {
  try {
    const locations = await Location.find({});
    res.status(200).json({ success: true, locations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Location by ID
exports.getLocationById = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }
    res.status(200).json({ success: true, location });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update Location
exports.updateLocation = async (req, res) => {
  try {
    const { state, district, city, policeStation } = req.body;
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }
    if (state) location.state = state;
    if (district) location.district = district;
    if (city) location.city = city;
    if (policeStation) location.policeStation = policeStation;

    await location.save();
    res.status(200).json({ success: true, location });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete Location
exports.deleteLocation = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }
    await location.deleteOne();
    res.status(200).json({ success: true, message: 'Location deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// ==========================================
// 3. USER MANAGEMENT & SYSTEM USERS SEARCH
// ==========================================

// Get All Users (with role filters, searchable by name/email)
exports.getUsers = async (req, res) => {
  try {
    const { role, active, search } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (active) filter.isActive = active === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter);
    
    // Map with profile details
    const usersWithProfiles = await Promise.all(
      users.map(async (user) => {
        let details = null;
        if (user.role === 'officer') {
          details = await Officer.findOne({ user: user._id }).populate('station');
        } else if (user.role === 'analyst') {
          details = await Analyst.findOne({ user: user._id });
        }
        return {
          user,
          details,
        };
      })
    );

    res.status(200).json({ success: true, users: usersWithProfiles });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update User (User Details & Details of Officer/Analyst)
exports.updateUser = async (req, res) => {
  try {
    const { name, email, isActive, role, badgeNo, station, contact, department } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update User main details
    if (name) user.name = name;
    if (email) user.email = email;
    if (isActive !== undefined) user.isActive = isActive;
    
    // Changing role is permitted but requires cleanup and creation of new profile
    const oldRole = user.role;
    if (role && role !== oldRole) {
      // Deleting old profile records
      if (oldRole === 'officer') await Officer.deleteOne({ user: user._id });
      if (oldRole === 'analyst') await Analyst.deleteOne({ user: user._id });
      
      user.role = role;
      
      // Creating new profile record
      if (role === 'officer') {
        await Officer.create({
          user: user._id,
          badgeNo: badgeNo || `BADGE-${Date.now()}`,
          station: station,
          contact: contact || 'N/A',
        });
      } else if (role === 'analyst') {
        await Analyst.create({
          user: user._id,
          department: department || 'General Analytics',
        });
      }
    } else {
      // Role has not changed, just update existing details
      if (user.role === 'officer') {
        const officer = await Officer.findOne({ user: user._id });
        if (officer) {
          if (badgeNo) officer.badgeNo = badgeNo;
          if (station) officer.station = station;
          if (contact) officer.contact = contact;
          await officer.save();
        }
      } else if (user.role === 'analyst') {
        const analyst = await Analyst.findOne({ user: user._id });
        if (analyst) {
          if (department) analyst.department = department;
          await analyst.save();
        }
      }
    }

    await user.save();

    // Fetch updated details to return
    let details = null;
    if (user.role === 'officer') {
      details = await Officer.findOne({ user: user._id }).populate('station');
    } else if (user.role === 'analyst') {
      details = await Analyst.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
      details,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Toggle User Status (Activate/Deactivate)
exports.toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Cannot deactivate oneself
    if (String(user._id) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Cannot activate/deactivate your own account' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account has been ${user.isActive ? 'activated' : 'deactivated'}`,
      isActive: user.isActive,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete User Profile and User Record
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (String(user._id) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    // Delete profiles
    if (user.role === 'officer') {
      await Officer.deleteOne({ user: user._id });
    } else if (user.role === 'analyst') {
      await Analyst.deleteOne({ user: user._id });
    }

    await user.deleteOne();
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Search Officers & Analysts (Admin-only)
exports.searchStaff = async (req, res) => {
  try {
    const { name, role, badgeNo, department } = req.query;
    
    let userFilters = {};
    if (name) userFilters.name = { $regex: name, $options: 'i' };
    if (role) {
      userFilters.role = role;
    } else {
      userFilters.role = { $in: ['officer', 'analyst'] };
    }

    const matchedUsers = await User.find(userFilters);
    const userIds = matchedUsers.map(u => u._id);

    let officerResults = [];
    let analystResults = [];

    if (!role || role === 'officer') {
      let officerQuery = { user: { $in: userIds } };
      if (badgeNo) officerQuery.badgeNo = { $regex: badgeNo, $options: 'i' };
      
      officerResults = await Officer.find(officerQuery)
        .populate('user', '-password')
        .populate('station');
    }

    if (!role || role === 'analyst') {
      let analystQuery = { user: { $in: userIds } };
      if (department) analystQuery.department = { $regex: department, $options: 'i' };

      analystResults = await Analyst.find(analystQuery)
        .populate('user', '-password');
    }

    res.status(200).json({
      success: true,
      officers: officerResults,
      analysts: analystResults,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// ==========================================
// 4. SYSTEM AUDIT LOGS
// ==========================================

// Get System Audit Logs
exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find({})
      .populate({
        path: 'user',
        select: 'name email role',
      })
      .sort({ timestamp: -1 })
      .limit(100); // return 100 most recent logs
    
    res.status(200).json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
