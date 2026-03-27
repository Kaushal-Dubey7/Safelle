require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Incident = require('../models/Incident');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/safelle';

const incidentTypes = ['harassment', 'theft', 'poor_lighting', 'unsafe_crowd', 'assault', 'other'];

// 20 sample incidents around New Delhi
const sampleIncidents = [
  { type: 'harassment', severity: 4, description: 'Verbal harassment near metro station exit', lat: 28.6328, lng: 77.2197 },
  { type: 'poor_lighting', severity: 3, description: 'Broken streetlights on entire stretch', lat: 28.6139, lng: 77.2090 },
  { type: 'theft', severity: 4, description: 'Phone snatching reported by multiple women', lat: 28.6280, lng: 77.2217 },
  { type: 'unsafe_crowd', severity: 2, description: 'Large unsupervised gathering at night', lat: 28.6353, lng: 77.2250 },
  { type: 'assault', severity: 5, description: 'Physical assault reported near underpass', lat: 28.6447, lng: 77.2165 },
  { type: 'harassment', severity: 3, description: 'Catcalling and following reported', lat: 28.6508, lng: 77.2340 },
  { type: 'poor_lighting', severity: 4, description: 'Dark alley with no CCTV coverage', lat: 28.6185, lng: 77.2310 },
  { type: 'theft', severity: 3, description: 'Bag snatching incident near bus stop', lat: 28.6225, lng: 77.2420 },
  { type: 'other', severity: 2, description: 'Stray dogs making area unsafe at night', lat: 28.6100, lng: 77.2150 },
  { type: 'harassment', severity: 4, description: 'Stalking incident reported to police', lat: 28.6400, lng: 77.2080 },
  { type: 'unsafe_crowd', severity: 3, description: 'Rowdy group blocking pedestrian path', lat: 28.6550, lng: 77.2100 },
  { type: 'poor_lighting', severity: 5, description: 'Complete blackout area, multiple incidents reported', lat: 28.6480, lng: 77.1950 },
  { type: 'harassment', severity: 3, description: 'Inappropriate comments from auto drivers', lat: 28.6200, lng: 77.1980 },
  { type: 'assault', severity: 4, description: 'Attempted robbery with physical threat', lat: 28.6350, lng: 77.2380 },
  { type: 'theft', severity: 2, description: 'Pickpocketing in crowded market area', lat: 28.6560, lng: 77.2290 },
  { type: 'poor_lighting', severity: 3, description: 'Dimly lit parking area near mall', lat: 28.6150, lng: 77.2400 },
  { type: 'harassment', severity: 5, description: 'Group harassment incident at night', lat: 28.6420, lng: 77.2450 },
  { type: 'unsafe_crowd', severity: 4, description: 'Drunk individuals creating unsafe environment', lat: 28.6300, lng: 77.2500 },
  { type: 'other', severity: 3, description: 'Abandoned construction site used for illicit activities', lat: 28.6250, lng: 77.1900 },
  { type: 'theft', severity: 4, description: 'Chain snatching at traffic signal', lat: 28.6180, lng: 77.2300 }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Incident.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminHash = await bcrypt.hash('Admin@123', 12);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@safelle.app',
      phone: '+919876543210',
      passwordHash: adminHash,
      age: 30,
      address: 'New Delhi, India',
      role: 'admin',
      contacts: [
        { name: 'Emergency Services', phone: '+91100' },
        { name: 'Women Helpline', phone: '+911091' }
      ]
    });
    console.log('Created admin user: admin@safelle.app / Admin@123');

    // Create test user
    const testHash = await bcrypt.hash('Test@123', 12);
    const testUser = await User.create({
      name: 'Priya Sharma',
      email: 'test@safelle.app',
      phone: '+919876543211',
      passwordHash: testHash,
      age: 25,
      address: 'Connaught Place, New Delhi',
      role: 'user',
      contacts: [
        { name: 'Rahul Sharma', phone: '+919876543212' },
        { name: 'Meera Patel', phone: '+919876543213' },
        { name: 'Anita Desai', phone: '+919876543214' }
      ]
    });
    console.log('Created test user: test@safelle.app / Test@123');

    // Create incidents
    const incidents = sampleIncidents.map(inc => ({
      type: inc.type,
      severity: inc.severity,
      description: inc.description,
      location: { type: 'Point', coordinates: [inc.lng, inc.lat] },
      reportedBy: testUser._id,
      verified: Math.random() > 0.5,
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000))
    }));

    await Incident.insertMany(incidents);
    console.log(`Created ${incidents.length} sample incidents around New Delhi`);

    console.log('\nSeed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
