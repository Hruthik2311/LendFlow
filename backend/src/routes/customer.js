const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const auth = require('../middleware/auth');

router.get('/', auth(['admin']), customerController.getAllCustomers);
router.post('/', auth(['admin']), customerController.createCustomer);

module.exports = router;
