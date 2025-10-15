const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const {
  reportIssue,
  getAllIssues,
  getUserIssues,
  updateIssueStatus,
  updateIssueNotes,
  deleteIssue,
  classifyImageHandler
} = require('../controllers/issueController');
const { verifyToken, authorizeAdmin } = require('../middleware/auth');
const { issueValidation } = require('../middleware/validation');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.get('/issues', getAllIssues);
router.get('/issues/user', verifyToken, getUserIssues);

router.post('/report', verifyToken, upload.single('image'), issueValidation, (req, res, next) => {
  const { latitude, longitude } = req.body;

  if (latitude && longitude) {
    req.body.location = {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)]
    };
  }

  reportIssue(req, res, next);
});

router.put('/issues/:issueId/status', verifyToken, updateIssueStatus);
router.delete('/issues/:issueId', verifyToken, deleteIssue);
router.post('/issues/classify-image', verifyToken, upload.single('image'), classifyImageHandler);

router.get('/admin/issues', verifyToken, authorizeAdmin, getAllIssues);
router.put('/admin/issues/:issueId/status', verifyToken, authorizeAdmin, updateIssueStatus);
router.put('/admin/issues/:issueId/notes', verifyToken, authorizeAdmin, updateIssueNotes);

module.exports = router;

