const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');

router.get('/', auth(['admin']), paymentController.getAllPayments);
router.post('/', auth(['customer']), paymentController.createPayment);
router.get('/loan/:loanId', auth(), paymentController.getPaymentsByLoan);

module.exports = router;
