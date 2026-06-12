const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SharedNote = sequelize.define('SharedNote', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  size: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  publishedBy: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = SharedNote;
