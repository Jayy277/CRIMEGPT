const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Officer = require('../models/Officer');
const Analyst = require('../models/Analyst');

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email/username and password' });
    }

    // Check for user (find by email or name)
    const user = await User.findOne({
      $or: [
        { email: usernameOrEmail.toLowerCase() },
        { name: usernameOrEmail },
      ],
    }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account is deactivated' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    // Get additional info if officer or analyst
    let extraDetails = {};
    if (user.role === 'officer') {
      extraDetails = await Officer.findOne({ user: user._id }).populate('station');
    } else if (user.role === 'analyst') {
      extraDetails = await Analyst.findOne({ user: user._id });
    }

    // Send response
    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
      details: extraDetails,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Register a user (Admin-only)
// @route   POST /api/auth/signup
// @access  Private/Admin
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role, badgeNo, station, contact, department } = req.body;

    // Check if email already exists
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Create User
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'officer',
    });

    let extraDetails = null;

    // Based on role, create specific profiles
    if (user.role === 'officer') {
      if (!badgeNo || !station || !contact) {
        // Rollback user creation
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({
          success: false,
          message: 'Officer requires badgeNo, station, and contact',
        });
      }

      extraDetails = await Officer.create({
        user: user._id,
        badgeNo,
        station,
        contact,
      });
    } else if (user.role === 'analyst') {
      if (!department) {
        // Rollback user creation
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({
          success: false,
          message: 'Analyst requires department',
        });
      }

      extraDetails = await Analyst.create({
        user: user._id,
        department,
      });
    }

    res.status(201).json({
      success: true,
      message: `${user.role.toUpperCase()} registered successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
      details: extraDetails,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Forgot Password - Request password reset token
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found with this email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire (10 minutes)
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    // In production we send an email. For CrimeGPT v1, we return the token in response and console log it.
    console.log(`Password reset token for ${user.email}: ${resetToken}`);

    res.status(200).json({
      success: true,
      message: 'Token generated and printed to console / returned in response',
      resetToken,
      resetUrl: `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Reset password using reset token
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    // Hash token from parameter
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Upload profile picture for Officer
// @route   POST /api/auth/profile-picture
// @access  Private/Officer
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a valid image file' });
    }

    const officer = await Officer.findOne({ user: req.user.id });
    if (!officer) {
      return res.status(404).json({ success: false, message: 'Officer profile not found' });
    }

    // Delete old profile picture if exists
    if (officer.profilePicture) {
      const oldPath = path.join(__dirname, '../', officer.profilePicture);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Save new profile picture path
    officer.profilePicture = `/uploads/${req.file.filename}`;
    await officer.save();

    const populatedOfficer = await Officer.findById(officer._id).populate('station');

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      details: populatedOfficer
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete profile picture for Officer
// @route   DELETE /api/auth/profile-picture
// @access  Private/Officer
exports.deleteProfilePicture = async (req, res) => {
  try {
    const officer = await Officer.findOne({ user: req.user.id });
    if (!officer) {
      return res.status(404).json({ success: false, message: 'Officer profile not found' });
    }

    // Delete file from disk
    if (officer.profilePicture) {
      const filePath = path.join(__dirname, '../', officer.profilePicture);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    officer.profilePicture = '';
    await officer.save();

    const populatedOfficer = await Officer.findById(officer._id).populate('station');

    res.status(200).json({
      success: true,
      message: 'Profile picture deleted successfully',
      details: populatedOfficer
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
