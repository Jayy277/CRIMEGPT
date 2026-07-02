const mongoose = require('mongoose');

const victimSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Victim name is required'],
      trim: true,
    },
    contact: {
      type: String,
      trim: true,
    },
    statement: {
      type: String,
      trim: true,
    },
    evidenceReference: {
      type: String,
      trim: true,
    },
    linkedCrime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crime',
      required: [true, 'Linked Crime reference is required'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Victim', victimSchema);
