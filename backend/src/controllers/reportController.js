const { 
  asyncHandler, 
  NotFoundError, 
  AuthorizationError 
} = require('../utils/errorHandler');
const Loan = require('../models/Loan');
const Customer = require('../models/Customer');
const Agent = require('../models/Agent');
const Payment = require('../models/Payment');
const { Op } = require('sequelize');

// Get recovered loans (loans with recoveryStatus = 'recovered')
exports.getRecoveredLoans = asyncHandler(async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    throw new AuthorizationError('Only admins can access reports');
  }

  const recoveredLoans = await Loan.findAll({
    where: {
      recoveryStatus: 'recovered'
    },
    include: [
      {
        model: Customer,
        attributes: ['id', 'name', 'email', 'phone']
      },
      {
        model: Agent,
        attributes: ['id', 'name', 'email', 'phone']
      }
    ],
    order: [['updatedAt', 'DESC']]
  });

  // Calculate additional details for each loan
  const loansWithDetails = await Promise.all(
    recoveredLoans.map(async (loan) => {
      // Get payments for this loan
      const payments = await Payment.findAll({
        where: { loanId: loan.id },
        order: [['paymentDate', 'ASC']]
      });

      // Calculate total paid amount
      const totalPaid = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

      // Calculate EMI and total due
      const principal = parseFloat(loan.amount);
      const rate = parseFloat(loan.interestRate) / 100 / 12;
      const n = parseInt(loan.termMonths);
      const emi = rate === 0 ? (principal / n) : (principal * rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
      const totalDue = emi * n;

      return {
        ...loan.toJSON(),
        totalPaid: totalPaid.toFixed(2),
        totalDue: totalDue.toFixed(2),
        emi: emi.toFixed(2),
        paymentCount: payments.length,
        lastPaymentDate: payments.length > 0 ? payments[payments.length - 1].paymentDate : null
      };
    })
  );

  // Calculate summary statistics
  const totalRecoveredAmount = loansWithDetails.reduce((sum, loan) => sum + parseFloat(loan.totalPaid), 0);
  const totalLoansCount = loansWithDetails.length;

  res.json({
    success: true,
    count: totalLoansCount,
    summary: {
      totalRecoveredAmount: totalRecoveredAmount.toFixed(2),
      totalLoansCount,
      averageRecoveryAmount: totalLoansCount > 0 ? (totalRecoveredAmount / totalLoansCount).toFixed(2) : '0.00'
    },
    data: { loans: loansWithDetails }
  });
});

// Get outstanding loans (loans with status = 'approved' and recoveryStatus = 'pending' or 'in-progress')
exports.getOutstandingLoans = asyncHandler(async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    throw new AuthorizationError('Only admins can access reports');
  }

  const outstandingLoans = await Loan.findAll({
    where: {
      status: 'approved'
    },
    include: [
      {
        model: Customer,
        attributes: ['id', 'name', 'email', 'phone']
      },
      {
        model: Agent,
        attributes: ['id', 'name', 'email', 'phone']
      }
    ],
    order: [['updatedAt', 'DESC']]
  });

  // Calculate additional details for each loan
  const loansWithDetails = await Promise.all(
    outstandingLoans.map(async (loan) => {
      // Get payments for this loan
      const payments = await Payment.findAll({
        where: { loanId: loan.id },
        order: [['paymentDate', 'ASC']]
      });

      // Calculate total paid amount
      const totalPaid = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

      // Calculate EMI and total due
      const principal = parseFloat(loan.amount);
      const rate = parseFloat(loan.interestRate) / 100 / 12;
      const n = parseInt(loan.termMonths);
      const emi = rate === 0 ? (principal / n) : (principal * rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
      const totalDue = emi * n;
      const outstandingAmount = Math.max(0, totalDue - totalPaid);
      
      // Consider fully paid if outstanding amount is less than ₹1
      const finalOutstandingAmount = outstandingAmount < 1 ? 0 : outstandingAmount;

      return {
        ...loan.toJSON(),
        totalPaid: totalPaid.toFixed(2),
        totalDue: totalDue.toFixed(2),
        outstandingAmount: finalOutstandingAmount.toFixed(2),
        emi: emi.toFixed(2),
        paymentCount: payments.length,
        lastPaymentDate: payments.length > 0 ? payments[payments.length - 1].paymentDate : null
      };
    })
  );

  // Calculate summary statistics
  const totalOutstandingAmount = loansWithDetails.reduce((sum, loan) => sum + parseFloat(loan.outstandingAmount), 0);
  const outstandingLoansFiltered = loansWithDetails.filter(loan => 
    loan.recoveryStatus !== 'recovered' && parseFloat(loan.outstandingAmount) > 0
  );
  const totalLoansCount = outstandingLoansFiltered.length;
  const pendingCount = outstandingLoansFiltered.filter(loan => loan.recoveryStatus === 'pending').length;
  const inProgressCount = outstandingLoansFiltered.filter(loan => loan.recoveryStatus === 'in_progress').length;

  res.json({
    success: true,
    count: totalLoansCount,
    summary: {
      totalOutstandingAmount: totalOutstandingAmount.toFixed(2),
      totalLoansCount,
      pendingCount,
      inProgressCount,
      averageOutstandingAmount: totalLoansCount > 0 ? (totalOutstandingAmount / totalLoansCount).toFixed(2) : '0.00'
    },
    data: { loans: outstandingLoansFiltered }
  });
});

// Get comprehensive recovery report with both recovered and outstanding loans
exports.getRecoveryReport = asyncHandler(async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    throw new AuthorizationError('Only admins can access reports');
  }

  // Get all loans with recovery status
  const allLoans = await Loan.findAll({
    where: {
      status: 'approved'
    },
    include: [
      {
        model: Customer,
        attributes: ['id', 'name', 'email', 'phone']
      },
      {
        model: Agent,
        attributes: ['id', 'name', 'email', 'phone']
      }
    ],
    order: [['updatedAt', 'DESC']]
  });

  // Calculate details for each loan
  const loansWithDetails = await Promise.all(
    allLoans.map(async (loan) => {
      const payments = await Payment.findAll({
        where: { loanId: loan.id },
        order: [['paymentDate', 'ASC']]
      });

      const totalPaid = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
      const principal = parseFloat(loan.amount);
      const rate = parseFloat(loan.interestRate) / 100 / 12;
      const n = parseInt(loan.termMonths);
      const emi = rate === 0 ? (principal / n) : (principal * rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
      const totalDue = emi * n;
      const outstandingAmount = Math.max(0, totalDue - totalPaid);
      
      // Consider fully paid if outstanding amount is less than ₹1
      const finalOutstandingAmount = outstandingAmount < 1 ? 0 : outstandingAmount;

      return {
        ...loan.toJSON(),
        totalPaid: totalPaid.toFixed(2),
        totalDue: totalDue.toFixed(2),
        outstandingAmount: finalOutstandingAmount.toFixed(2),
        emi: emi.toFixed(2),
        paymentCount: payments.length,
        lastPaymentDate: payments.length > 0 ? payments[payments.length - 1].paymentDate : null
      };
    })
  );

  // Categorize loans
  const recoveredLoans = loansWithDetails.filter(loan => loan.recoveryStatus === 'recovered');
  const outstandingLoans = loansWithDetails.filter(loan => 
    loan.recoveryStatus !== 'recovered' && parseFloat(loan.outstandingAmount) > 0
  );

  // Calculate summary statistics
  const totalRecoveredAmount = recoveredLoans.reduce((sum, loan) => sum + parseFloat(loan.totalPaid), 0);
  const totalOutstandingAmount = outstandingLoans.reduce((sum, loan) => sum + parseFloat(loan.outstandingAmount), 0);
  const totalLoansAmount = loansWithDetails.reduce((sum, loan) => sum + parseFloat(loan.totalDue), 0);

  const recoveryRate = totalLoansAmount > 0 ? ((totalRecoveredAmount / totalLoansAmount) * 100).toFixed(2) : '0.00';

  res.json({
    success: true,
    summary: {
      totalLoans: loansWithDetails.length,
      recoveredLoans: recoveredLoans.length,
      outstandingLoans: outstandingLoans.length,
      totalRecoveredAmount: totalRecoveredAmount.toFixed(2),
      totalOutstandingAmount: totalOutstandingAmount.toFixed(2),
      totalLoansAmount: totalLoansAmount.toFixed(2),
      recoveryRate: `${recoveryRate}%`
    },
    data: {
      recoveredLoans,
      outstandingLoans
    }
  });
});
