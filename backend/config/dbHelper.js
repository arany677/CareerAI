const User = require('../models/User');
const Resume = require('../models/Resume');
const CoverLetter = require('../models/CoverLetter');

const dbHelper = {
  // USER CRUD
  findUserByEmail: async (email) => {
    return await User.findOne({ email: email.toLowerCase() });
  },

  createUser: async (userData) => {
    return await User.create(userData);
  },

  findUserById: async (id) => {
    return await User.findById(id).select('-password');
  },

  updateUserProfile: async (id, profileData, hashedPassword = null) => {
    const user = await User.findById(id);
    if (!user) return null;
    if (hashedPassword) user.password = hashedPassword;

    const { targetRole, skills, experience, education } = profileData;
    if (targetRole !== undefined) user.profile.targetRole = targetRole;
    if (skills !== undefined) user.profile.skills = skills;
    if (experience !== undefined) user.profile.experience = experience;
    if (education !== undefined) user.profile.education = education;

    return await user.save();
  },

  // RESUME CRUD
  createResume: async (resumeData) => {
    return await Resume.create(resumeData);
  },

  findResumesByUser: async (userId) => {
    return await Resume.find({ userId }).sort({ uploadedAt: -1 });
  },

  findLatestResumeByUser: async (userId) => {
    return await Resume.findOne({ userId }).sort({ uploadedAt: -1 });
  },

  // COVER LETTER CRUD
  createCoverLetter: async (letterData) => {
    return await CoverLetter.create(letterData);
  },

  findCoverLettersByUser: async (userId) => {
    return await CoverLetter.find({ userId }).sort({ createdAt: -1 });
  },

  findCoverLetterById: async (id) => {
    return await CoverLetter.findById(id);
  },

  deleteCoverLetter: async (id) => {
    const letter = await CoverLetter.findById(id);
    if (letter) {
      await letter.deleteOne();
      return true;
    }
    return false;
  },

  // ADMIN OPERATIONS
  countUsers: async () => await User.countDocuments(),
  countResumes: async () => await Resume.countDocuments(),
  countCoverLetters: async () => await CoverLetter.countDocuments(),

  getRecentUsers: async (limit) => {
    return await User.find({}).select('-password').sort({ createdAt: -1 }).limit(limit);
  },

  getRecentResumes: async (limit) => {
    return await Resume.find({}).populate('userId', 'name email').sort({ uploadedAt: -1 }).limit(limit);
  },

  getRecentCoverLetters: async (limit) => {
    return await CoverLetter.find({}).populate('userId', 'name email').sort({ createdAt: -1 }).limit(limit);
  },

  getAllUsers: async () => {
    return await User.find({}).select('-password').sort({ createdAt: -1 });
  },

  deleteUser: async (id) => {
    const user = await User.findById(id);
    if (user) {
      await Resume.deleteMany({ userId: id });
      await CoverLetter.deleteMany({ userId: id });
      await user.deleteOne();
      return true;
    }
    return false;
  }
};

module.exports = dbHelper;