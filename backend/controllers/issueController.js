const { classify } = require('../utils/classifier');
const Issue = require('../models/Issue');

exports.reportIssue = async (req, res) => {
  const { title, description, location } = req.body;
  const imagePath = req.file ? req.file.path : null;

  try {
    const category = await classify(description);
    const issue = new Issue({
      title,
      description,
      location,
      category,
      imagePath,
      status: 'Pending',
    });

    await issue.save();
    res.json(issue);
  } catch (err) {
    console.error('Error reporting issue:', err);
    res.status(500).json({ message: 'Error reporting issue', error: err.message });
  }
};
