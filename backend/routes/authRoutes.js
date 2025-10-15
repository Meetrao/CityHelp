const express = require('express');
const router = express.Router();
const { signup, login, getProfile } = require('../controllers/authController');
const { getAllIssues } = require('../controllers/issueController');
const { signupValidation, loginValidation } = require('../middleware/validation');
const { verifyToken, requireRole, authenticate, authorizeAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Issue = require('../models/Issue');

// Public routes
router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.get('/profile', verifyToken, getProfile);

// Admin-only routes
router.get('/users', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find({}, 'name email role');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

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
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/issues/:id/assign', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { adminId } = req.body;
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    issue.assignedTo = adminId;
    await issue.save();

    res.json({ message: 'Issue assigned', issue });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Moved here: Admin issue list route
router.get('/admin/issues', verifyToken, requireRole('admin'), getAllIssues);

module.exports = router;
