const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('doubt', 'report', 'system', 'announcement', 'session', 'assignment'),
    defaultValue: 'system'
  },
  unread: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  actionTab: {
    type: DataTypes.STRING,
    allowNull: true
  },
  groupName: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = Notification;
