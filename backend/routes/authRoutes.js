const express = require('express');
const router = express.Router();
const { signup, login, getProfile } = require('../controllers/authController');
const { signupValidation, loginValidation } = require('../middleware/validation');
const { verifyToken, requireRole } = require('../middleware/auth');
const User = require('../models/User');
const Issue = require('../models/Issue');

// Public routes
router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);

// Protected route: Get logged-in user's profile
router.get('/profile', verifyToken, getProfile);

// ✅ Admin-only: Get all users
router.get('/users', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find({}, 'name email role');
    res.json({ users });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Admin-only: Update user role
router.put('/users/:id/role', verifyToken, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['admin', 'citizen'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Role updated', user });
  } catch (err) {
    console.error('Error updating role:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Admin-only: Get issues with status filter and pagination
router.get('/admin/issues', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const rawStatus = req.query.status || 'all';
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    let query = {};
    if (rawStatus !== 'all') {
      query.status = { $regex: `^${rawStatus}$`, $options: 'i' };
    }

    const total = await Issue.countDocuments(query);
    const issues = await Issue.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      issues,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('Error fetching admin issues:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
