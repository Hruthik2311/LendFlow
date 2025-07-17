const { DataTypes } = require('sequelize');
const {sequelize} = require('./index');
const Customer = require('./Customer');
const Agent = require('./Agent');

const Loan = sequelize.define('Loan', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  interestRate: { type: DataTypes.FLOAT, allowNull: false },
  termMonths: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'approved', 'rejected', 'active', 'closed', 'defaulted'), defaultValue: 'pending' },
  startDate: { type: DataTypes.DATE },
  endDate: { type: DataTypes.DATE },
  agentId: { type: DataTypes.INTEGER, allowNull: true }, // assigned agent for recovery
  emiSchedule: { type: DataTypes.JSONB, allowNull: true }, // store EMI schedule as JSON
  recoveryStatus: { type: DataTypes.STRING, allowNull: true }, // e.g. 'pending', 'in-progress', 'recovered'
}, {
  timestamps: true,
});

Loan.belongsTo(Customer, { foreignKey: 'customerId' });
Customer.hasMany(Loan, { foreignKey: 'customerId' });
Loan.belongsTo(Agent, { foreignKey: 'agentId' });
Agent.hasMany(Loan, { foreignKey: 'agentId' });

module.exports = Loan;
