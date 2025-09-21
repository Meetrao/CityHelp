const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: String,
  description: String,
  location: String,
  category: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Issue', issueSchema);
