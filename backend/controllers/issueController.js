const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const { validationResult } = require('express-validator');
const Issue = require('../models/Issue');
const User = require('../models/User');

exports.getAllIssues = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      const formattedStatus = status
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      filter.status = formattedStatus;
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

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

    if (status && status !== 'all') {
      const formattedStatus = status
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      filter.status = formattedStatus;
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    const issues = await Issue.find(filter).sort({ createdAt: -1 });
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
    let category = 'general';
    if (imagePath) {
      const form = new FormData();
      form.append('image', fs.createReadStream(imagePath));
      const response = await axios.post('http://localhost:5001/classify', form, {
        headers: form.getHeaders()
      });
      category = response.data.category || 'general';
    }

    const departmentMap = {
      pothole: 'Roads',
      garbage: 'Sanitation',
      wire: 'Electricity',
      waterlogging: 'Drainage',
      flood: 'Disaster Management',
      signal: 'Traffic'
    };
    const department = departmentMap[category] || 'General';

    let imageData = null;
    if (imagePath) {
      const buffer = fs.readFileSync(imagePath);
      imageData = {
        data: buffer,
        contentType: req.file.mimetype
      };
    }

    const issue = new Issue({
      title,
      description,
      location,
      category,
      department,
      imageData,
      imagePath,
      status: 'Pending',
      reportedBy: req.user._id
    });

    await issue.save();

    const pointsAwarded = 10;
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { points: pointsAwarded }
    });

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

exports.updateIssueNotes = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { notes } = req.body;

    const issue = await Issue.findByIdAndUpdate(
      issueId,
      { notes },
      { new: true }
    ).populate('reportedBy', 'name email');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    res.json(issue);
  } catch (err) {
    console.error('Error updating issue notes:', err);
    res.status(500).json({ message: 'Error updating issue notes', error: err.message });
  }
};

exports.deleteIssue = async (req, res) => {
  try {
    const { issueId } = req.params;

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

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

exports.classifyImageHandler = async (req, res) => {
  const imagePath = req.file ? req.file.path : null;

  if (!imagePath) {
    return res.status(400).json({ message: 'No image uploaded' });
  }

  try {
    const form = new FormData();
    form.append('image', fs.createReadStream(imagePath));

    const response = await axios.post('http://localhost:5001/classify', form, {
      headers: form.getHeaders()
    });

    const category = response.data.category || 'general';
    console.log('Image classified as:', category);

    res.json({ category });
  } catch (err) {
    console.error('Error classifying image:', err);
    res.status(500).json({ 
      message: 'Error classifying image', 
      error: err.message 
    });
  }
};
