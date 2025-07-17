const Agent = require('../models/Agent');
const { asyncHandler } = require('../utils/errorHandler');

exports.getAllAgents = asyncHandler(async (req, res) => {
  const agents = await Agent.findAll({
    order: [['name', 'ASC']]
  });
  
  res.json({
    success: true,
    count: agents.length,
    data: agents
  });
});

exports.createAgent = asyncHandler(async (req, res) => {
  const agent = await Agent.create(req.body);
  
  res.status(201).json({
    success: true,
    message: 'Agent created successfully',
    data: agent
  });
});
