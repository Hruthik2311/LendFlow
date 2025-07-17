const Customer = require('../models/Customer');

exports.getAllCustomers = async (req, res) => {
  const customers = await Customer.findAll();
  res.json(customers);
};

exports.createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
