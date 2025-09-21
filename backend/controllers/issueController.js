const { classify } = require('../utils/classifier');
const Issue = require('../models/Issue');

exports.reportIssue = async (req, res) => {
  const { title, description, location } = req.body;

  try {
    const category = await classify(description);
    const issue = new Issue({ title, description, location, category });
    await issue.save();
    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: 'Classifier or DB error' });
  }
};
