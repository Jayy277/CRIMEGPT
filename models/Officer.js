const mongoose = require('mongoose');

const officerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
    },
    badgeNo: {
      type: String,
      required: [true, 'Badge number is required'],
      unique: true,
      trim: true,
    },
    station: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: [true, 'Assigned station is required'],
    },
    contact: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Officer', officerSchema);
