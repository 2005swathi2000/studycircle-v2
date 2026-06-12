const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const GroupMember = sequelize.define('GroupMember', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  role: {
    type: DataTypes.ENUM('student', 'mentor', 'admin'),
    defaultValue: 'student'
  }
});

module.exports = GroupMember;
