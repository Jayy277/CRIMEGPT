// models/DjangoUser.js
// Read-only Sequelize model for Django's authentication_customuser table.
// Used to JOIN citizen records with their user info.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DjangoUser = sequelize.define('DjangoUser', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'authentication_customuser',
  timestamps: false,
});

module.exports = DjangoUser;
