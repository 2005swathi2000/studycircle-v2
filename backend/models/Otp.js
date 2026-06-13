const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Otp = sequelize.define('Otp', {
  phoneOrEmail: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  otp: {
    type: DataTypes.STRING,
    allowNull: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
});

module.exports = Otp;
