const { classify } = require('../utils/classifier');

exports.reportIssue = async (req, res) => {
  const { title, description, location } = req.body;

  try {
    const category = await classify(description);
    const issue = { title, description, location, category };
    console.log('Received issue:', issue);
    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: 'Classifier failed' });
  }
};
