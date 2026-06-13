const mongoose = require('mongoose');
const User = require('../models/User');
const Resume = require('../models/Resume');
const CoverLetter = require('../models/CoverLetter');
const { getDb, saveDb } = require('./jsonDb');

const isMongoOnline = () => {
  return mongoose.connection.readyState === 1;
};

// Generate random Hex ID mimicking MongoDB ObjectId
const generateId = () => {
  return Math.random().toString(16).substring(2, 14) + Math.random().toString(16).substring(2, 14);
};

const dbHelper = {
  // USER CRUD
  findUserByEmail: async (email) => {
    if (isMongoOnline()) {
      return await User.findOne({ email: email.toLowerCase() });
    }
    const db = getDb();
    const user = db.users.find(u => u.email === email.toLowerCase());
    return user || null;
  },

  createUser: async (userData) => {
    if (isMongoOnline()) {
      return await User.create(userData);
    }
    const db = getDb();
    const newUser = {
      _id: generateId(),
      ...userData,
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    saveDb(db);
    return newUser;
  },

  findUserById: async (id) => {
    if (isMongoOnline()) {
      return await User.findById(id).select('-password');
    }
    const db = getDb();
    const user = db.users.find(u => u._id === id);
    if (!user) return null;
    
    // Return copy without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  updateUserProfile: async (id, profileData, hashedPassword = null) => {
    if (isMongoOnline()) {
      const user = await User.findById(id);
      if (!user) return null;
      if (hashedPassword) user.password = hashedPassword;
      
      const { targetRole, skills, experience, education } = profileData;
      if (targetRole !== undefined) user.profile.targetRole = targetRole;
      if (skills !== undefined) user.profile.skills = skills;
      if (experience !== undefined) user.profile.experience = experience;
      if (education !== undefined) user.profile.education = education;
      
      return await user.save();
    }
    
    const db = getDb();
    const userIdx = db.users.findIndex(u => u._id === id);
    if (userIdx === -1) return null;
    
    const user = db.users[userIdx];
    if (hashedPassword) user.password = hashedPassword;
    
    const { targetRole, skills, experience, education } = profileData;
    if (targetRole !== undefined) user.profile.targetRole = targetRole;
    if (skills !== undefined) user.profile.skills = skills;
    if (experience !== undefined) user.profile.experience = experience;
    if (education !== undefined) user.profile.education = education;
    
    db.users[userIdx] = user;
    saveDb(db);
    
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  // RESUME CRUD
  createResume: async (resumeData) => {
    if (isMongoOnline()) {
      return await Resume.create(resumeData);
    }
    const db = getDb();
    const newResume = {
      _id: generateId(),
      ...resumeData,
      uploadedAt: new Date().toISOString()
    };
    db.resumes.push(newResume);
    saveDb(db);
    return newResume;
  },

  findResumesByUser: async (userId) => {
    if (isMongoOnline()) {
      return await Resume.find({ userId }).sort({ uploadedAt: -1 });
    }
    const db = getDb();
    const list = db.resumes.filter(r => r.userId === userId.toString());
    return list.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  },

  findLatestResumeByUser: async (userId) => {
    if (isMongoOnline()) {
      return await Resume.findOne({ userId }).sort({ uploadedAt: -1 });
    }
    const db = getDb();
    const list = db.resumes.filter(r => r.userId === userId.toString());
    if (list.length === 0) return null;
    list.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    return list[0];
  },

  // COVER LETTER CRUD
  createCoverLetter: async (letterData) => {
    if (isMongoOnline()) {
      return await CoverLetter.create(letterData);
    }
    const db = getDb();
    const newLetter = {
      _id: generateId(),
      ...letterData,
      createdAt: new Date().toISOString()
    };
    db.coverletters.push(newLetter);
    saveDb(db);
    return newLetter;
  },

  findCoverLettersByUser: async (userId) => {
    if (isMongoOnline()) {
      return await CoverLetter.find({ userId }).sort({ createdAt: -1 });
    }
    const db = getDb();
    const list = db.coverletters.filter(l => l.userId === userId.toString());
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  findCoverLetterById: async (id) => {
    if (isMongoOnline()) {
      return await CoverLetter.findById(id);
    }
    const db = getDb();
    return db.coverletters.find(l => l._id === id) || null;
  },

  deleteCoverLetter: async (id) => {
    if (isMongoOnline()) {
      const letter = await CoverLetter.findById(id);
      if (letter) {
        await letter.deleteOne();
        return true;
      }
      return false;
    }
    const db = getDb();
    const index = db.coverletters.findIndex(l => l._id === id);
    if (index !== -1) {
      db.coverletters.splice(index, 1);
      saveDb(db);
      return true;
    }
    return false;
  },

  // ADMIN OPERATIONS
  countUsers: async () => {
    if (isMongoOnline()) return await User.countDocuments();
    return getDb().users.length;
  },

  countResumes: async () => {
    if (isMongoOnline()) return await Resume.countDocuments();
    return getDb().resumes.length;
  },

  countCoverLetters: async () => {
    if (isMongoOnline()) return await CoverLetter.countDocuments();
    return getDb().coverletters.length;
  },

  getRecentUsers: async (limit) => {
    if (isMongoOnline()) {
      return await User.find({}).select('-password').sort({ createdAt: -1 }).limit(limit);
    }
    const list = getDb().users.map(({ password, ...u }) => u);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);
  },

  getRecentResumes: async (limit) => {
    if (isMongoOnline()) {
      return await Resume.find({}).populate('userId', 'name email').sort({ uploadedAt: -1 }).limit(limit);
    }
    const db = getDb();
    const list = db.resumes.map(r => {
      const u = db.users.find(user => user._id === r.userId);
      return {
        ...r,
        userId: u ? { _id: u._id, name: u.name, email: u.email } : { name: 'Unknown User' }
      };
    });
    return list.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()).slice(0, limit);
  },

  getRecentCoverLetters: async (limit) => {
    if (isMongoOnline()) {
      return await CoverLetter.find({}).populate('userId', 'name email').sort({ createdAt: -1 }).limit(limit);
    }
    const db = getDb();
    const list = db.coverletters.map(l => {
      const u = db.users.find(user => user._id === l.userId);
      return {
        ...l,
        userId: u ? { _id: u._id, name: u.name, email: u.email } : { name: 'Unknown User' }
      };
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);
  },

  getAllUsers: async () => {
    if (isMongoOnline()) {
      return await User.find({}).select('-password').sort({ createdAt: -1 });
    }
    const list = getDb().users.map(({ password, ...u }) => u);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  deleteUser: async (id) => {
    if (isMongoOnline()) {
      const user = await User.findById(id);
      if (user) {
        await Resume.deleteMany({ userId: id });
        await CoverLetter.deleteMany({ userId: id });
        await user.deleteOne();
        return true;
      }
      return false;
    }
    
    const db = getDb();
    const userIdx = db.users.findIndex(u => u._id === id);
    if (userIdx !== -1) {
      // Cascading deletes
      db.users.splice(userIdx, 1);
      db.resumes = db.resumes.filter(r => r.userId !== id);
      db.coverletters = db.coverletters.filter(l => l.userId !== id);
      saveDb(db);
      return true;
    }
    return false;
  }
};

module.exports = dbHelper;
