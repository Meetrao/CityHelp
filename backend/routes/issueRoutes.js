const express = require('express');
const router = express.Router();
const { reportIssue } = require('../controllers/issueController');

router.post('/report', reportIssue);

module.exports = router;
