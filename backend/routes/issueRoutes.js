const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { 
  reportIssue, 
  getAllIssues, 
  getUserIssues, 
  updateIssueStatus, 
  deleteIssue,
  classifyImageHandler // 🧠 New controller for testing classification
} = require('../controllers/issueController');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { issueValidation } = require('../middleware/validation');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Public routes
router.get('/issues', getAllIssues);

// Protected routes
router.get('/issues/user', verifyToken, getUserIssues);
router.post('/report', verifyToken, upload.single('image'), issueValidation, reportIssue);
router.put('/issues/:issueId/status', verifyToken, updateIssueStatus);
router.delete('/issues/:issueId', verifyToken, deleteIssue);

// 🧪 Optional: Test classifier directly
router.post('/issues/classify-image', verifyToken, upload.single('image'), classifyImageHandler);

// Admin routes
router.get('/admin/issues', verifyToken, requireAdmin, getAllIssues);

module.exports = router;
