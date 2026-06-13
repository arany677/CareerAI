const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const { getDb, saveDb } = require('../config/jsonDb');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedDatabase = async () => {
  const adminEmail = 'admin@careerai.com';
  const demoEmail = 'demo@careerai.com';

  const defaultAdmin = {
    _id: 'admin_user_id_0000000000001',
    name: 'System Administrator',
    email: adminEmail,
    role: 'admin',
    profile: {
      targetRole: 'Full Stack Architect',
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express.js', 'MongoDB', 'Docker', 'AWS'],
      experience: [
        {
          company: 'Tech Solutions Corp',
          position: 'Lead Web Engineer',
          duration: '2023 - Present',
          description: 'Supervised 6-person frontend engineering guild and migrated server deployments to Docker containers, increasing speeds by 30%.'
        }
      ],
      education: [
        {
          school: 'State Technical University',
          degree: 'Bachelor of Science',
          fieldOfStudy: 'Computer Science',
          year: '2022'
        }
      ]
    },
    createdAt: new Date().toISOString()
  };

  const defaultDemo = {
    _id: 'demo_user_id_0000000000002',
    name: 'Demo Candidate',
    email: demoEmail,
    role: 'user',
    profile: {
      targetRole: 'Frontend Developer',
      skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Git'],
      experience: [
        {
          company: 'Creative Web Agency',
          position: 'Junior React Developer',
          duration: '2024 - 2025',
          description: 'Created custom reusable design system elements and optimized site styling assets, improving mobile performance metrics.'
        }
      ],
      education: [
        {
          school: 'Global Tech Institute',
          degree: 'Associate Degree',
          fieldOfStudy: 'Web Development',
          year: '2023'
        }
      ]
    },
    createdAt: new Date().toISOString()
  };

  // 1. Seed local JSON database (Always do this as fallback)
  try {
    const salt = await bcrypt.genSalt(10);
    const db = getDb();
    
    // Seed Admin
    const localAdminExists = db.users.find(u => u.email === adminEmail);
    if (!localAdminExists) {
      const adminPwdHashed = await bcrypt.hash('adminpassword123', salt);
      db.users.push({ ...defaultAdmin, password: adminPwdHashed });
    }

    // Seed Demo User
    const localDemoExists = db.users.find(u => u.email === demoEmail);
    if (!localDemoExists) {
      const demoPwdHashed = await bcrypt.hash('demouser123', salt);
      db.users.push({ ...defaultDemo, password: demoPwdHashed });
    }

    saveDb(db);
    console.log('Local JSON file database successfully seeded (db_store.json).');
  } catch (err) {
    console.error('Failed to seed local JSON database:', err.message);
  }

  // 2. Try seeding MongoDB if online
  try {
    const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careerai';
    
    // Set connection timeout low so it fails quickly if offline
    await mongoose.connect(dbUri, { serverSelectionTimeoutMS: 2000 });
    console.log('MongoDB connection established for seeding.');

    // Seed Admin in MongoDB
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('adminpassword123', salt);
      await User.create({ ...defaultAdmin, password: hashedPassword });
      console.log('Admin user seeded in MongoDB: admin@careerai.com / adminpassword123');
    }

    // Seed Demo in MongoDB
    const demoExists = await User.findOne({ email: demoEmail });
    if (!demoExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('demouser123', salt);
      await User.create({ ...defaultDemo, password: hashedPassword });
      console.log('Demo user seeded in MongoDB: demo@careerai.com / demouser123');
    }

    await mongoose.disconnect();
    console.log('MongoDB seeding complete.');
    process.exit(0);
  } catch (err) {
    console.log('MongoDB server is offline. Seeding skipped for MongoDB (using local JSON database fallback).');
    process.exit(0);
  }
};

seedDatabase();
