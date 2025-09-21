const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  imagePath: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved', 'Closed'],
    default: 'Pending'
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  coordinates: {
    lat: Number,
    lng: Number
  },
  tags: [String],
  resolutionNotes: {
    type: String,
    default: ''
  },
  resolvedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for better query performance
issueSchema.index({ reportedBy: 1, status: 1 });
issueSchema.index({ category: 1, status: 1 });
issueSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Issue', issueSchema);
