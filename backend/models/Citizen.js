// models/Citizen.js
// Sequelize model that reads from the Django-managed authentication_citizen table.
// This is READ-ONLY from the Node side; Django owns the schema/migrations.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Citizen = sequelize.define('Citizen', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  // FK to Django's authentication_customuser table
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  mobile: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  dob: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  gender: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  pincode: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  identity_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  identity_number: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  identity_document: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected'),
    defaultValue: 'pending',
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'authentication_citizen',
  timestamps: false,   // Django manages created_at manually, no updatedAt
});

module.exports = Citizen;
