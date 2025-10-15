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

  if (!role || !['admin', 'citizen'].includes(role)) {
    return res.status(400).json({ message: 'Invalid or missing role' });
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

// ✅ Admin-only: Update issue status
router.put('/admin/issues/:id/status', verifyToken, requireRole('admin'), async (req, res) => {
  console.log('🔄 Status update request received:', req.params.id, req.body);
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['Pending', 'In Progress', 'Resolved', 'Closed'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid or missing status' });
  }

  try {
    const issue = await Issue.findByIdAndUpdate(id, { status }, { new: true });
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    res.json({ message: 'Status updated', issue });
  } catch (err) {
    console.error('Error updating issue status:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Admin-only: Update issue notes
router.put('/admin/issues/:id/notes', verifyToken, requireRole('admin'), async (req, res) => {
  console.log('📝 Notes update request received:', req.params.id, req.body);
  const { id } = req.params;
  const { notes } = req.body;

  if (typeof notes !== 'string') {
    return res.status(400).json({ message: 'Invalid or missing notes' });
  }

  try {
    const issue = await Issue.findByIdAndUpdate(id, { notes }, { new: true });
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    res.json({ message: 'Notes updated', issue });
  } catch (err) {
    console.error('Error updating issue notes:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
