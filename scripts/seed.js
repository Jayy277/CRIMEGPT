const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Location = require('../models/Location');
const CrimeCategory = require('../models/CrimeCategory');

dotenv.config();

const sampleLocations = [
  {
    state: 'Maharashtra',
    district: 'Mumbai City',
    city: 'Mumbai',
    policeStation: 'Colaba Police Station',
  },
  {
    state: 'Maharashtra',
    district: 'Mumbai Suburban',
    city: 'Mumbai',
    policeStation: 'Andheri Police Station',
  },
  {
    state: 'Delhi',
    district: 'New Delhi',
    city: 'New Delhi',
    policeStation: 'Connaught Place Police Station',
  },
  {
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    city: 'Bengaluru',
    policeStation: 'Koramangala Police Station',
  },
  {
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    city: 'Bengaluru',
    policeStation: 'Indiranagar Police Station',
  },
];

const sampleCategories = [
  {
    name: 'Theft',
    sections: [
      { act: 'BNS', section: '305', description: 'Theft in a dwelling house, etc.' },
      { act: 'BNS', section: '306', description: 'Theft by clerk or servant of property in possession of master' },
      { act: 'BNS', section: '307', description: 'Theft after preparation made for causing death, hurt or restraint' },
    ],
  },
  {
    name: 'Robbery',
    sections: [
      { act: 'BNS', section: '309', description: 'Robbery and punishment for robbery' },
      { act: 'BNS', section: '310', description: 'Dacoity and punishment for dacoity' },
      { act: 'BNS', section: '311', description: 'Robbery, or dacoity, with attempt to cause death or grievous hurt' },
    ],
  },
  {
    name: 'Assault',
    sections: [
      { act: 'BNS', section: '115', description: 'Voluntarily causing hurt' },
      { act: 'BNS', section: '117', description: 'Voluntarily causing grievous hurt' },
      { act: 'BNS', section: '121', description: 'Assault or criminal force to deter public servant from duty' },
    ],
  },
  {
    name: 'Cyber Crime',
    sections: [
      { act: 'BNS', section: '318', description: 'Cheating (Online/Impersonation)' },
      { act: 'BNS', section: '66D (IT Act)', description: 'Punishment for cheating by personation by using computer resource' },
      { act: 'BNS', section: '66C (IT Act)', description: 'Identity theft' },
    ],
  },
  {
    name: 'Fraud',
    sections: [
      { act: 'BNS', section: '316', description: 'Criminal breach of trust' },
      { act: 'BNS', section: '318', description: 'Cheating and dishonestly inducing delivery of property' },
      { act: 'BNS', section: '336', description: 'Forgery and punishment for forgery' },
    ],
  },
  {
    name: 'Missing Person',
    sections: [
      { act: 'BNSS', section: '84', description: 'Proclamation for person absconding / missing query' },
      { act: 'BNS', section: '140', description: 'Kidnapping or abducting in order to murder' },
    ],
  },
  {
    name: 'Narcotics',
    sections: [
      { act: 'NDPS Act', section: '15', description: 'Punishment for contravention in relation to poppy straw' },
      { act: 'NDPS Act', section: '20', description: 'Punishment for contravention in relation to cannabis plant and cannabis' },
      { act: 'NDPS Act', section: '22', description: 'Punishment for contravention in relation to psychotropic substances' },
    ],
  },
  {
    name: 'Traffic Crime',
    sections: [
      { act: 'BNS', section: '281', description: 'Rash driving or riding on a public way' },
      { act: 'BNS', section: '106', description: 'Causing death by negligence (Hit and Run cases)' },
      { act: 'Motor Vehicles Act', section: '185', description: 'Driving by a drunken person or under the influence of drugs' },
    ],
  },
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/crimegpt';
    console.log('Connecting to database for seeding...');
    await mongoose.connect(mongoUri);

    // 1. Seed Locations
    console.log('Clearing old locations...');
    await Location.deleteMany({});
    console.log('Seeding locations...');
    await Location.insertMany(sampleLocations);
    console.log(`Successfully seeded ${sampleLocations.length} locations.`);

    // 2. Seed Crime Categories
    console.log('Clearing old crime categories...');
    await CrimeCategory.deleteMany({});
    console.log('Seeding crime categories...');
    await CrimeCategory.insertMany(sampleCategories);
    console.log(`Successfully seeded ${sampleCategories.length} crime categories.`);

    // 3. Seed Default Admin User
    console.log('Checking for admin user...');
    const adminEmail = 'admin@crimegpt.com';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      console.log('Seeding default Admin user...');
      await User.create({
        name: 'System Administrator',
        email: adminEmail,
        password: 'Admin@123',
        role: 'admin',
        isActive: true,
      });
      console.log('Successfully seeded admin user (admin@crimegpt.com / Admin@123).');
    } else {
      console.log('Admin user already exists.');
    }

    console.log('Database Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDB();
