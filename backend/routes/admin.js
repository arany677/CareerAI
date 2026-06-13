const express = require('express');
const router = express.Router();
const dbHelper = require('../config/dbHelper');
const { protect, admin } = require('../middleware/auth');

// @route   GET api/admin/dashboard
router.get('/dashboard', protect, admin, async (req, res) => {
  try {
    const totalUsers = await dbHelper.countUsers();
    const totalResumes = await dbHelper.countResumes();
    const totalCoverLetters = await dbHelper.countCoverLetters();

    const users = await dbHelper.getRecentUsers(5);
    const resumes = await dbHelper.getRecentResumes(5);
    const letters = await dbHelper.getRecentCoverLetters(5);

    res.json({
      stats: {
        totalUsers,
        totalResumes,
        totalCoverLetters
      },
      recentUsers: users,
      recentResumes: resumes,
      recentCoverLetters: letters
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   GET api/admin/users
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await dbHelper.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   DELETE api/admin/users/:id
router.delete('/users/:id', protect, admin, async (req, res) => {
  try {
    const userId = req.params.id;

    if (userId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own admin account.' });
    }

    const success = await dbHelper.deleteUser(userId);
    if (!success) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User and all associated data successfully deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;
