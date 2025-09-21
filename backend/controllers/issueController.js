const { classify } = require('../utils/classifier');
const Issue = require('../models/Issue');
const User = require('../models/User');
const { validationResult } = require('express-validator');

exports.getAllIssues = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (category) filter.category = category;
    
    const issues = await Issue.find(filter)
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Issue.countDocuments(filter);
    
    res.json({
      issues,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error('Error fetching issues:', err);
    res.status(500).json({ message: 'Error fetching issues', error: err.message });
  }
};

exports.getUserIssues = async (req, res) => {
  try {
    const { status, category } = req.query;
    const filter = { reportedBy: req.user._id };
    
    if (status) filter.status = status;
    if (category) filter.category = category;
    
    const issues = await Issue.find(filter)
      .sort({ createdAt: -1 });
    
    res.json(issues);
  } catch (err) {
    console.error('Error fetching user issues:', err);
    res.status(500).json({ message: 'Error fetching user issues', error: err.message });
  }
};

exports.reportIssue = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, location } = req.body;
  const imagePath = req.file ? req.file.path : null;

  try {
    console.log('Classifying issue with description:', description);
    const category = await classify(description);
    console.log('Classified as:', category);
    
    const issue = new Issue({
      title,
      description,
      location,
      category,
      imagePath,
      status: 'Pending',
      reportedBy: req.user._id
    });

    await issue.save();
    
    // Award points to user
    const pointsAwarded = 10; // Base points for reporting
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { points: pointsAwarded }
    });
    
    console.log('Issue saved successfully:', issue._id);
    console.log(`Awarded ${pointsAwarded} points to user ${req.user._id}`);
    
    res.json({
      ...issue.toObject(),
      pointsAwarded
    });
  } catch (err) {
    console.error('Error reporting issue:', err);
    res.status(500).json({ 
      message: 'Error reporting issue', 
      error: err.message,
      details: 'Check server logs for more information'
    });
  }
};

exports.updateIssueStatus = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['Pending', 'In Progress', 'Resolved', 'Closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const issue = await Issue.findByIdAndUpdate(
      issueId,
      { status },
      { new: true }
    ).populate('reportedBy', 'name email');
    
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    
    res.json(issue);
  } catch (err) {
    console.error('Error updating issue status:', err);
    res.status(500).json({ message: 'Error updating issue status', error: err.message });
  }
};

exports.deleteIssue = async (req, res) => {
  try {
    const { issueId } = req.params;
    
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    
    // Only allow deletion if user is admin or the issue reporter
    if (req.user.role !== 'admin' && issue.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this issue' });
    }
    
    await Issue.findByIdAndDelete(issueId);
    res.json({ message: 'Issue deleted successfully' });
  } catch (err) {
    console.error('Error deleting issue:', err);
    res.status(500).json({ message: 'Error deleting issue', error: err.message });
  }
};
