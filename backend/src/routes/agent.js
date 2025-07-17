const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const auth = require('../middleware/auth');

router.get('/', auth(['admin']), agentController.getAllAgents);
router.post('/', auth(['admin']), agentController.createAgent);

module.exports = router;
