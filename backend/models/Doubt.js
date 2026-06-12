const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Doubt = sequelize.define('Doubt', {
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
    allowNull: false
  },
  tags: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: ''
  },
  upvotes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isSolved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  groupId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  }
});

module.exports = Doubt;
