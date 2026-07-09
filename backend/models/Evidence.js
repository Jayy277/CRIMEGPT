const mongoose = require('mongoose');

const evidenceSchema = new mongoose.Schema(
  {
    evidenceId: {
      type: String,
      unique: true,
    },
    type: {
      type: String,
      required: [true, 'Evidence type is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Evidence description is required'],
      trim: true,
    },
    collectionDate: {
      type: Date,
      default: Date.now,
    },
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Officer',
      required: [true, 'Assigned Officer reference is required'],
    },
    linkedCrime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crime',
      required: [true, 'Linked Crime reference is required'],
    },
    filePath: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate evidenceId (e.g., EV-2026-10023)
evidenceSchema.pre('save', async function () {
  if (!this.evidenceId) {
    const year = this.collectionDate ? new Date(this.collectionDate).getFullYear() : new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    const sequenceStr = String(count + 1).padStart(5, '0');
    this.evidenceId = `EV-${year}-${sequenceStr}`;
  }
});

module.exports = mongoose.model('Evidence', evidenceSchema);
