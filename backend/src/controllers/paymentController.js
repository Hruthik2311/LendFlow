const Payment = require('../models/Payment');
const Loan = require('../models/Loan');
const { asyncHandler } = require('../utils/errorHandler');

exports.getAllPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.findAll({ 
    include: Loan,
    order: [['createdAt', 'DESC']]
  });
  
  res.json({
    success: true,
    count: payments.length,
    data: payments
  });
});

exports.createPayment = asyncHandler(async (req, res) => {
  const { loanId, amount } = req.body;
  const payment = await Payment.create({ 
    loanId, 
    amount, 
    paymentDate: new Date(), 
    status: 'completed' 
  });
  
  res.status(201).json({
    success: true,
    message: 'Payment created successfully',
    data: payment
  });
});

// Get payments by loan
exports.getPaymentsByLoan = asyncHandler(async (req, res) => {
  const { loanId } = req.params;
  const payments = await Payment.findAll({ 
    where: { loanId },
    order: [['createdAt', 'DESC']]
  });
  
  res.json({
    success: true,
    count: payments.length,
    data: payments
  });
});
