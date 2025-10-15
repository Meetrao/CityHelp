const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');

router.get('/stats', async (req, res) => {
  try {
    const issues = await Issue.find();

    const total = issues.length;
    const resolved = issues.filter(i => i.status === 'Resolved').length;
    const pending = issues.filter(i => i.status === 'Pending').length;
    const closed = issues.filter(i => i.status === 'Closed').length;
    const inProgress = issues.filter(i => i.status === 'In Progress').length;

    const categories = {};
    issues.forEach(i => {
      categories[i.category] = (categories[i.category] || 0) + 1;
    });

    res.json({ total, resolved, pending, closed, inProgress, categories });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ message: 'Failed to load stats' });
  }
});

module.exports = router;
