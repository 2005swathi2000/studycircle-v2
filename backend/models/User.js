const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('student', 'mentor', 'admin'),
    defaultValue: 'student'
  },
  phoneOrEmail: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  streakCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastStudyDate: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: ''
  },
  totalStudyHours: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  avatarUrl: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: true
  },
  xp: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  focusCoins: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  department: {
    type: DataTypes.STRING,
    defaultValue: 'CSE'
  },
  badges: {
    type: DataTypes.TEXT,
    defaultValue: '[]'
  },
  provider: {
    type: DataTypes.STRING,
    defaultValue: 'local'
  },
  learningGoal: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  learningLevel: {
    type: DataTypes.STRING,
    defaultValue: 'beginner'
  },
  dailyTarget: {
    type: DataTypes.FLOAT,
    defaultValue: 2.0
  },
  dailyMissions: {
    type: DataTypes.JSON,
    allowNull: true
  },
  dailyMissionDate: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: ''
  },
  dailyXpEarned: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastSessionXpAwardedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  },
  assignedTasks: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  }
}, {
  hooks: {
    beforeCreate: async (user) => {
      const isBcryptHash = typeof user.password === 'string' && /^\$2[ayb]\$[0-9]{2}\$[./A-Za-z0-9]{53}$/.test(user.password);
      if (user.password && !isBcryptHash) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      const isBcryptHash = typeof user.password === 'string' && /^\$2[ayb]\$[0-9]{2}\$[./A-Za-z0-9]{53}$/.test(user.password);
      if (user.changed('password') && user.password && !isBcryptHash) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

User.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;
