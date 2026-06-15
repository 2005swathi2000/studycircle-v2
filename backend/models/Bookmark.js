const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Bookmark = sequelize.define('Bookmark', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  noteId: {
    type: DataTypes.UUID,
    allowNull: false
  }
});

module.exports = Bookmark;
