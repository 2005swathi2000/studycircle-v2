const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Answer = sequelize.define('Answer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isAccepted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  upvotes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  doubtId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  }
});

module.exports = Answer;
