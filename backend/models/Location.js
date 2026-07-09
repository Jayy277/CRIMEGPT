const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    policeStation: {
      type: String,
      required: [true, 'Police Station is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate entries for the exact same station details
locationSchema.index({ state: 1, district: 1, city: 1, policeStation: 1 }, { unique: true });

module.exports = mongoose.model('Location', locationSchema);
