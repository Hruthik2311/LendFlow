
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT,
    logging: false,
  }
);

const Customer = sequelize.define('Customer', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  phone: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING },
}, {
  timestamps: true,
});

const Agent = sequelize.define('Agent', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  phone: { type: DataTypes.STRING, allowNull: false },
}, {
  timestamps: true,
});

const Loan = sequelize.define('Loan', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  interestRate: { type: DataTypes.FLOAT, allowNull: false },
  termMonths: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'approved', 'rejected', 'active', 'closed', 'defaulted'), defaultValue: 'pending' },
  startDate: { type: DataTypes.DATE },
  endDate: { type: DataTypes.DATE },
  agentId: { type: DataTypes.INTEGER, allowNull: true },
  emiSchedule: { type: DataTypes.JSONB, allowNull: true },
  recoveryStatus: { type: DataTypes.STRING, allowNull: true },
}, {
  timestamps: true,
});

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  paymentDate: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'completed', 'failed'), defaultValue: 'pending' },
}, {
  timestamps: true,
});

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'agent', 'customer'), allowNull: false },
}, {
  timestamps: true,
});

// Associations
Loan.belongsTo(Customer, { foreignKey: 'customerId' });
Customer.hasMany(Loan, { foreignKey: 'customerId' });
Loan.belongsTo(Agent, { foreignKey: 'agentId' });
Agent.hasMany(Loan, { foreignKey: 'agentId' });
Payment.belongsTo(Loan, { foreignKey: 'loanId' });
Loan.hasMany(Payment, { foreignKey: 'loanId' });

module.exports = {
  sequelize,
  Customer,
  Agent,
  Loan,
  Payment,
  User
};


