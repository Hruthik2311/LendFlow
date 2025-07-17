const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');

// All report routes require admin authentication
router.use(auth(['admin']));

// Get recovered loans report
router.get('/recovered', reportController.getRecoveredLoans);

// Get outstanding loans report
router.get('/outstanding', reportController.getOutstandingLoans);

// Get comprehensive recovery report
router.get('/recovery', reportController.getRecoveryReport);

module.exports = router;
