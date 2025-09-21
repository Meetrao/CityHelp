const { classify } = require('../utils/classifier');
const Issue = require('../models/Issue');

exports.getAllIssues = async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    console.error('Error fetching issues:', err);
    res.status(500).json({ message: 'Error fetching issues', error: err.message });
  }
};

exports.reportIssue = async (req, res) => {
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
    });

    await issue.save();
    console.log('Issue saved successfully:', issue._id);
    res.json(issue);
  } catch (err) {
    console.error('Error reporting issue:', err);
    res.status(500).json({ 
      message: 'Error reporting issue', 
      error: err.message,
      details: 'Check server logs for more information'
    });
  }
};
