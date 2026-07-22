// models/index.js  —  Central model registry + table sync
const sequelize = require('../config/db');

// Import all models
const User                  = require('./User');
const Location              = require('./Location');
const Officer               = require('./Officer');
const Citizen               = require('./Citizen');
const DjangoUser            = require('./DjangoUser');
const { CrimeCategory, CrimeCategorySection } = require('./CrimeCategory');
const { Crime, CrimeNote, CrimeSelectedSection } = require('./Crime');
const Evidence              = require('./Evidence');
const { Suspect, SuspectPreviousCase } = require('./Suspect');
const Notification          = require('./Notification');
const Analyst               = require('./Analyst');
const AuditLog              = require('./AuditLog');
const Victim                = require('./Victim');

// ── Associations ──────────────────────────────────────────────────────────────
User.hasOne(Officer,   { foreignKey: 'userId', as: 'officerProfile' });
User.hasOne(Analyst,   { foreignKey: 'userId', as: 'analystProfile' });
Officer.belongsTo(User,     { foreignKey: 'userId' });
Analyst.belongsTo(User,     { foreignKey: 'userId' });
Officer.belongsTo(Location, { foreignKey: 'stationId', as: 'station' });

// Django-managed citizen tables (read-only from Node side)
Citizen.belongsTo(DjangoUser, { foreignKey: 'user_id', as: 'user' });

CrimeCategory.hasMany(Crime,     { foreignKey: 'categoryId', as: 'crimes' });
Crime.belongsTo(CrimeCategory,   { foreignKey: 'categoryId', as: 'category' });
Crime.belongsTo(Location,        { foreignKey: 'locationId', as: 'location' });
Crime.belongsTo(Officer,         { foreignKey: 'officerId',  as: 'officer' });

Evidence.belongsTo(Officer, { foreignKey: 'assignedOfficerId', as: 'assignedOfficer' });
Evidence.belongsTo(Crime,   { foreignKey: 'linkedCrimeId',    as: 'linkedCrime' });

Suspect.belongsTo(Crime, { foreignKey: 'linkedCrimeId', as: 'linkedCrime' });
Suspect.belongsToMany(Crime, {
  through: SuspectPreviousCase,
  foreignKey: 'suspectId',
  otherKey: 'crimeId',
  as: 'previousCases',
});

Notification.belongsTo(User,  { foreignKey: 'recipientId', as: 'recipient' });
AuditLog.belongsTo(User,      { foreignKey: 'userId',      as: 'user' });
Victim.belongsTo(Crime,       { foreignKey: 'linkedCrimeId', as: 'linkedCrime' });

// ── Sync all tables to MySQL (alter:true = safe update, won't drop data) ──────
const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅  MySQL connected via Sequelize');
    await sequelize.sync({ alter: true });
    console.log('✅  All tables synced to MySQL (crimepilot database)');
  } catch (err) {
    console.error('❌  MySQL connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  syncDatabase,
  User, Location, Officer, Analyst,
  Citizen, DjangoUser,
  CrimeCategory, CrimeCategorySection,
  Crime, CrimeNote, CrimeSelectedSection,
  Evidence,
  Suspect, SuspectPreviousCase,
  Notification,
  AuditLog,
  Victim,
};
