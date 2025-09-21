const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { reportIssue, getAllIssues } = require('../controllers/issueController');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.get('/issues', getAllIssues);
router.post('/report', upload.single('image'), reportIssue);

module.exports = router;
