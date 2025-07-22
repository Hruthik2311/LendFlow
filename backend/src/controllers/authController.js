const User = require('../models/User');
const Customer = require('../models/Customer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { 
  asyncHandler, 
  ValidationError, 
  NotFoundError, 
  AuthenticationError,
  ConflictError 
} = require('../utils/errorHandler');

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  // Validate password strength
  if (password.length < 6) {
    const remaining = 6 - password.length;
    throw new ValidationError(`Password must be at least 6 characters long. Please add ${remaining} more character${remaining > 1 ? 's' : ''}.`);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  const user = await User.create({ 
    name, 
    email, 
    password: hashedPassword, 
    role 
  });

  // Create associated records based on role
  try {
    if (role === 'customer') {
      await Customer.create({ 
        name, 
        email, 
        phone: phone || '', 
        address: '', 
        id: user.id 
      });
    } else if (role === 'agent') {
      if (!phone) {
        throw new ValidationError('Phone number is required for agent registration');
      }
      const Agent = require('../models/Agent');
      await Agent.create({ 
        name, 
        email, 
        phone, 
        id: user.id 
      });
    }
  } catch (error) {
    // If creating associated record fails, delete the user
    await User.destroy({ where: { id: user.id } });
    throw error;
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, role: user.role }, 
    process.env.JWT_SECRET, 
    { expiresIn: '24h' }
  );

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      },
      token
    }
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new AuthenticationError('Please enter correct email/password');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AuthenticationError('Please enter correct email/password');
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, role: user.role }, 
    process.env.JWT_SECRET, 
    { expiresIn: '24h' }
  );

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      },
      token
    }
  });
});

// Get current user profile
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] }
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  res.json({
    success: true,
    data: { user }
  });
});

// Update user profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, email, phone } = req.body;
  const userId = req.user.id;

  const user = await User.findByPk(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Check if email is being changed and if it's already taken
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictError('Email already in use');
    }
  }

  // Update user
  await user.update({ name: name || user.name, email: email || user.email });

  // Update associated records
  if (user.role === 'customer') {
    const customer = await Customer.findByPk(userId);
    if (customer) {
      await customer.update({ 
        name: name || customer.name, 
        email: email || customer.email,
        phone: phone || customer.phone 
      });
    }
  } else if (user.role === 'agent') {
    const Agent = require('../models/Agent');
    const agent = await Agent.findByPk(userId);
    if (agent) {
      await agent.update({ 
        name: name || agent.name, 
        email: email || agent.email,
        phone: phone || agent.phone 
      });
    }
  }

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      }
    }
  });
});
