const Loan = require('../models/Loan');
const Customer = require('../models/Customer');
const Agent = require('../models/Agent');
const User = require('../models/User');
const { notificationService } = require('../services/NotificationService');
const { 
  asyncHandler, 
  NotFoundError, 
  ValidationError, 
  AuthorizationError 
} = require('../utils/errorHandler');

exports.getAllLoans = asyncHandler(async (req, res) => {
  const loans = await Loan.findAll({ 
    include: [Customer, Agent],
    order: [['createdAt', 'DESC']]
  });
  
  res.json({
    success: true,
    count: loans.length,
    data: { loans }
  });
});

exports.createLoan = asyncHandler(async (req, res) => {
    const { customerId, amount, interestRate, termMonths } = req.body;

  // Validate customer exists
  const customer = await Customer.findByPk(customerId);
  if (!customer) {
    throw new NotFoundError('Customer not found');
  }

  // Validate loan amount
  if (amount <= 0) {
    throw new ValidationError('Loan amount must be greater than 0');
  }

  // Validate interest rate
  if (interestRate < 0 || interestRate > 100) {
    throw new ValidationError('Interest rate must be between 0 and 100');
  }

  // Validate term
  if (termMonths < 1 || termMonths > 360) {
    throw new ValidationError('Loan term must be between 1 and 360 months');
  }

  const loan = await Loan.create({ 
    customerId, 
    amount, 
    interestRate, 
    termMonths, 
    status: 'pending' 
  });

  // Fetch the created loan with customer details
  const createdLoan = await Loan.findByPk(loan.id, { include: [Customer] });

  res.status(201).json({
    success: true,
    message: 'Loan application submitted successfully',
    data: { loan: createdLoan }
  });
});

exports.updateLoanStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
  const { status } = req.body;
  const userId = req.user.id;

  const loan = await Loan.findByPk(id, { include: [Customer, Agent] });
  if (!loan) {
    throw new NotFoundError('Loan not found');
  }

  // Validate status transition
  const validStatuses = ['pending', 'approved', 'rejected', 'active', 'closed', 'defaulted'];
  if (!validStatuses.includes(status)) {
    throw new ValidationError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  // Check if user has permission to update this loan
  if (req.user.role === 'customer' && loan.customerId !== userId) {
    throw new AuthorizationError('You can only update your own loans');
  }

  // Validate status transitions
  if (loan.status === 'closed' && status !== 'closed') {
    throw new ValidationError('Cannot modify a closed loan');
  }

  if (loan.status === 'rejected' && status !== 'rejected') {
    throw new ValidationError('Cannot modify a rejected loan');
  }

  // Update loan status
    loan.status = status;
  
    if (status === 'approved') {
      loan.startDate = new Date();
    // Calculate end date based on term
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + loan.termMonths);
    loan.endDate = endDate;
    
    console.log(`Loan ${loan.id} approved by user ${userId}`);
  } else if (status === 'rejected') {
    console.log(`Loan ${loan.id} rejected by user ${userId}`);
  } else if (status === 'defaulted') {
    loan.recoveryStatus = 'pending';
    console.log(`Loan ${loan.id} marked as defaulted by user ${userId}`);
  }

  await loan.save();

  res.json({
    success: true,
    message: `Loan status updated to ${status}`,
    data: { loan }
  });
});

exports.assignAgent = asyncHandler(async (req, res) => {
  const { id } = req.params;
    const { agentId } = req.body;

  // Check if user is admin
  if (req.user.role !== 'admin') {
    throw new AuthorizationError('Only admins can assign agents to loans');
  }

  const loan = await Loan.findByPk(id, { include: [Customer, Agent] });
  if (!loan) {
    throw new NotFoundError('Loan not found');
  }

  // Validate agent exists
  const agent = await Agent.findByPk(agentId);
  if (!agent) {
    throw new NotFoundError('Agent not found');
  }

  // Check if loan is approved or defaulted (can assign agents to both)
  if (loan.status !== 'approved' && loan.status !== 'defaulted') {
    throw new ValidationError('Can only assign agents to approved or defaulted loans');
  }

  // Check if agent is already assigned
  if (loan.agentId === agentId) {
    throw new ValidationError('This agent is already assigned to this loan');
  }

    loan.agentId = agentId;
  
  // Set recovery status based on loan status
  if (loan.status === 'approved') {
    loan.recoveryStatus = 'pending';
  } else if (loan.status === 'defaulted') {
    loan.recoveryStatus = 'assigned';
  }
  
    await loan.save();

    console.log(`Agent ${agentId} assigned to loan ${loan.id} by admin ${req.user.id}`);

    // Send notification to the assigned agent
    try {
      // Find the User that corresponds to this Agent (by email)
      const user = await User.findOne({ where: { email: agent.email, role: 'agent' } });
      
      if (user) {
        const notificationMessage = `You have been assigned to Loan #${loan.id} (₹${loan.amount}) for customer ${loan.Customer?.name || 'Unknown'}. Please review and begin recovery process.`;
        
        await notificationService.sendNotification(
          user.id, // Use User ID instead of Agent ID
          notificationMessage,
          'loan_assignment',
          {
            loanId: loan.id,
            loanAmount: loan.amount,
            customerName: loan.Customer?.name,
            customerEmail: loan.Customer?.email,
            loanStatus: loan.status,
            recoveryStatus: loan.recoveryStatus,
            assignedBy: req.user.id,
            assignedAt: new Date().toISOString()
          }
        );
        
        console.log(`✅ Notification sent to User ID ${user.id} for Agent ${agentId}`);
      } else {
        console.warn(`⚠️ No User found for Agent ${agentId} with email ${agent.email}`);
      }
    } catch (notificationError) {
      // Log notification error but don't fail the assignment
      console.error('Failed to send notification:', notificationError);
    }

  res.json({
    success: true,
    message: 'Agent assigned successfully',
    data: { loan }
  });
});

exports.getLoansByCustomer = asyncHandler(async (req, res) => {
  const { customerId } = req.params;

  // Check if user has permission to view these loans
  if (req.user.role === 'customer' && req.user.id !== parseInt(customerId)) {
    throw new AuthorizationError('You can only view your own loans');
  }

  const customer = await Customer.findByPk(customerId);
  if (!customer) {
    throw new NotFoundError('Customer not found');
  }

  const loans = await Loan.findAll({ 
    where: { customerId }, 
    include: [Agent],
    order: [['createdAt', 'DESC']]
  });

  res.json({
    success: true,
    count: loans.length,
    data: { loans, customer }
  });
});

exports.getLoansByAgent = asyncHandler(async (req, res) => {
  const { agentId } = req.params;

  // Check if user has permission to view these loans
  if (req.user.role === 'agent' && req.user.id !== parseInt(agentId)) {
    throw new AuthorizationError('You can only view your own assigned loans');
  }

  const agent = await Agent.findByPk(agentId);
  if (!agent) {
    throw new NotFoundError('Agent not found');
  }

  const loans = await Loan.findAll({ 
    where: { agentId }, 
    include: [Customer],
    order: [['createdAt', 'DESC']]
  });

  res.json({
    success: true,
    count: loans.length,
    data: { loans, agent }
  });
});

exports.updateRecoveryStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
    const { recoveryStatus } = req.body;
  const userId = req.user.id;

  const loan = await Loan.findByPk(id, { include: [Customer, Agent] });
  if (!loan) {
    throw new NotFoundError('Loan not found');
  }

  // Check if user has permission to update recovery status
  if (req.user.role === 'agent' && loan.agentId !== userId) {
    throw new AuthorizationError('You can only update loans assigned to you');
  }
  
  // Admins can update any loan's recovery status
  if (req.user.role !== 'admin' && req.user.role !== 'agent') {
    throw new AuthorizationError('Only admins and agents can update recovery status');
  }

  // Validate recovery status
  const validRecoveryStatuses = ['pending', 'assigned', 'in_progress', 'contacted', 'negotiated', 'recovered', 'failed'];
  if (!validRecoveryStatuses.includes(recoveryStatus)) {
    throw new ValidationError(`Invalid recovery status. Must be one of: ${validRecoveryStatuses.join(', ')}`);
  }

    loan.recoveryStatus = recoveryStatus;
    await loan.save();

  console.log(`Recovery status for loan ${loan.id} updated to '${recoveryStatus}' by ${req.user.role} ${userId}`);

  res.json({
    success: true,
    message: 'Recovery status updated successfully',
    data: { loan }
  });
});

exports.getLoanById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const loan = await Loan.findByPk(id, { include: [Customer, Agent] });
  if (!loan) {
    throw new NotFoundError('Loan not found');
  }

  // Check if user has permission to view this loan
  if (req.user.role === 'customer' && loan.customerId !== req.user.id) {
    throw new AuthorizationError('You can only view your own loans');
  }

  if (req.user.role === 'agent' && loan.agentId !== req.user.id) {
    throw new AuthorizationError('You can only view loans assigned to you');
  }

  res.json({
    success: true,
    data: { loan }
  });
});

exports.deleteLoan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const loan = await Loan.findByPk(id, { include: [Customer, Agent] });
  if (!loan) {
    throw new NotFoundError('Loan not found');
  }

  // Only allow deletion of rejected loans
  if (loan.status !== 'rejected') {
    throw new ValidationError('Only rejected loans can be deleted');
  }

  // Check if user has permission to delete this loan
  if (req.user.role === 'customer' && loan.customerId !== userId) {
    throw new AuthorizationError('You can only delete your own loans');
  }

  // Only customers, admins, and agents can delete loans
  if (!['customer', 'admin', 'agent'].includes(req.user.role)) {
    throw new AuthorizationError('You do not have permission to delete loans');
  }

  // Delete the loan
  await loan.destroy();

  console.log(`Loan ${loan.id} deleted by ${req.user.role} ${userId}`);

  res.json({
    success: true,
    message: 'Loan deleted successfully'
  });
});
