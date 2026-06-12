const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Session = sequelize.define('Session', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  scheduledAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  durationMinutes: {
    type: DataTypes.INTEGER,
    defaultValue: 60
  },
  meetingLink: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'upcoming'
  },
  groupId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false
  }
});

module.exports = Session;
