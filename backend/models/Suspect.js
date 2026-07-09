const mongoose = require('mongoose');

const suspectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Suspect name is required'],
      trim: true,
    },
    age: {
      type: Number,
    },
    gender: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    photoPath: {
      type: String,
      default: '',
    },
    previousCases: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Crime',
      },
    ],
    status: {
      type: String,
      enum: ['Suspect', 'Detained', 'Arrested', 'Released'],
      default: 'Suspect',
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

module.exports = mongoose.model('Suspect', suspectSchema);
