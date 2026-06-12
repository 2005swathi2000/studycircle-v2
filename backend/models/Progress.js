const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Progress = sequelize.define('Progress', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  groupId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  studyMinutes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  notesCreated: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  tasksCompleted: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

module.exports = Progress;
