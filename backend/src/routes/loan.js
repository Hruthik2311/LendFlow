const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const { loanValidation } = require('../middleware/validation');
const auth = require('../middleware/auth');

// Public routes (if any)
// None for loans

// Protected routes
router.get('/', auth(), loanController.getAllLoans);
router.get('/:id', auth(), loanController.getLoanById);

// Customer routes
router.post('/', auth(['customer']), loanValidation.create, loanController.createLoan);
router.get('/customer/:customerId', auth(['customer']), loanController.getLoansByCustomer);

// Admin/Agent routes
router.patch('/:id/status', auth(['admin', 'agent']), loanValidation.updateStatus, loanController.updateLoanStatus);
router.patch('/:id/assign-agent', auth(['admin']), loanController.assignAgent);

// Agent routes
router.get('/agent/:agentId', auth(['agent']), loanController.getLoansByAgent);
router.patch('/:id/recovery-status', auth(['admin', 'agent']), loanController.updateRecoveryStatus);

// Delete route for rejected loans
router.delete('/:id', auth(['customer', 'admin', 'agent']), loanController.deleteLoan);

module.exports = router;
