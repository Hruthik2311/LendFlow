const { DataTypes } = require('sequelize');
const {sequelize} = require('./index');

const Agent = sequelize.define('Agent', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  phone: { type: DataTypes.STRING, allowNull: false },
}, {
  timestamps: true,
});

module.exports = Agent;
