const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Note = sequelize.define('Note', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isPinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  groupId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false
  },
  lastEditedBy: {
    type: DataTypes.UUID,
    allowNull: false
  }
});

module.exports = Note;
