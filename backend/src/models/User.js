const { DataTypes } = require('sequelize');
const {sequelize} = require('./index');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'agent', 'customer'), allowNull: false },
}, {
  timestamps: true,
});

module.exports = User;
