const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  act: {
    type: String,
    required: [true, 'Act name is required (e.g. BNS, BNSS, BSA)'],
    trim: true,
  },
  section: {
    type: String,
    required: [true, 'Section number/clause is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Section description is required'],
    trim: true,
  },
});

const crimeCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Crime Category name is required'],
      unique: true,
      trim: true,
    },
    sections: [sectionSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CrimeCategory', crimeCategorySchema);
