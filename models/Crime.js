const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  note: {
    type: String,
    required: [true, 'Note text is required'],
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const selectedSectionSchema = new mongoose.Schema({
  act: String,
  section: String,
  description: String,
});

const crimeSchema = new mongoose.Schema(
  {
    crimeId: {
      type: String,
      unique: true,
    },
    crimeCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CrimeCategory',
      required: [true, 'Crime Category is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date of crime is required'],
    },
    time: {
      type: String,
      required: [true, 'Time of crime is required'],
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: [true, 'Location is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    officer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Officer',
      required: [true, 'Assigned Officer is required'],
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Reported', 'Assigned', 'Under Investigation', 'Evidence Collected', 'Solved', 'Closed'],
      default: 'Reported',
    },
    sections: [selectedSectionSchema],
    notes: [noteSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field isPending
crimeSchema.virtual('isPending').get(function () {
  return this.status !== 'Solved' && this.status !== 'Closed';
});

// Text index on description for similarity search
crimeSchema.index({ description: 'text' });

// Auto-generate crimeId (e.g., CR-2026-10023)
crimeSchema.pre('save', async function () {
  if (!this.crimeId) {
    const year = this.date ? new Date(this.date).getFullYear() : new Date().getFullYear();
    // Count existing crimes in the current year to generate sequential number
    const startOfYear = new Date(`${year}-01-01`);
    const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);
    
    const count = await this.constructor.countDocuments({
      date: { $gte: startOfYear, $lte: endOfYear }
    });
    
    const sequenceStr = String(count + 1).padStart(5, '0');
    this.crimeId = `CR-${year}-${sequenceStr}`;
  }
});

module.exports = mongoose.model('Crime', crimeSchema);
