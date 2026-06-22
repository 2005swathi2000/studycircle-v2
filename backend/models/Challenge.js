const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Challenge = sequelize.define('Challenge', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  groupId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  targetType: {
    type: DataTypes.ENUM('study_hours', 'notes_uploaded', 'doubts_solved'),
    allowNull: false
  },
  targetValue: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  currentProgress: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0
  },
  xpReward: {
    type: DataTypes.INTEGER,
    defaultValue: 150
  },
  coinReward: {
    type: DataTypes.INTEGER,
    defaultValue: 50
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'expired'),
    defaultValue: 'active'
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false
  }
});

module.exports = Challenge;
