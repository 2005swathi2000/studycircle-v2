const sequelize = require('../config/db');
const User = require('./User');
const Group = require('./Group');
const GroupMember = require('./GroupMember');
const Note = require('./Note');
const Session = require('./Session');
const Progress = require('./Progress');
const Doubt = require('./Doubt');
const Answer = require('./Answer');
const SharedNote = require('./SharedNote');
const Bookmark = require('./Bookmark');
const Otp = require('./Otp');
const Notification = require('./Notification');
const Challenge = require('./Challenge');
const MentorRating = require('./MentorRating');

// M-M relations
User.belongsToMany(Group, { through: GroupMember, foreignKey: 'userId' });
Group.belongsToMany(User, { through: GroupMember, foreignKey: 'groupId' });

GroupMember.belongsTo(User, { foreignKey: 'userId' });
GroupMember.belongsTo(Group, { foreignKey: 'groupId' });
Group.hasMany(GroupMember, { foreignKey: 'groupId' });
User.hasMany(GroupMember, { foreignKey: 'userId' });

// Notes
Group.hasMany(Note, { foreignKey: 'groupId' });
Note.belongsTo(Group, { foreignKey: 'groupId' });
User.hasMany(Note, { foreignKey: 'createdBy', as: 'CreatedNotes' });
Note.belongsTo(User, { foreignKey: 'createdBy', as: 'Creator' });

// Sessions
Group.hasMany(Session, { foreignKey: 'groupId' });
Session.belongsTo(Group, { foreignKey: 'groupId' });
User.hasMany(Session, { foreignKey: 'createdBy', as: 'CreatedSessions' });
Session.belongsTo(User, { foreignKey: 'createdBy', as: 'Creator' });

// Progress
User.hasMany(Progress, { foreignKey: 'userId' });
Progress.belongsTo(User, { foreignKey: 'userId' });
Group.hasMany(Progress, { foreignKey: 'groupId' });
Progress.belongsTo(Group, { foreignKey: 'groupId' });

// Doubts
Group.hasMany(Doubt, { foreignKey: 'groupId' });
Doubt.belongsTo(Group, { foreignKey: 'groupId' });
User.hasMany(Doubt, { foreignKey: 'userId', as: 'CreatedDoubts' });
Doubt.belongsTo(User, { foreignKey: 'userId', as: 'Author' });

// Answers
Doubt.hasMany(Answer, { foreignKey: 'doubtId', onDelete: 'CASCADE' });
Answer.belongsTo(Doubt, { foreignKey: 'doubtId' });
User.hasMany(Answer, { foreignKey: 'userId', as: 'CreatedAnswers' });
Answer.belongsTo(User, { foreignKey: 'userId', as: 'Author' });

// Bookmarks
User.hasMany(Bookmark, { foreignKey: 'userId', onDelete: 'CASCADE' });
Bookmark.belongsTo(User, { foreignKey: 'userId' });
SharedNote.hasMany(Bookmark, { foreignKey: 'noteId', onDelete: 'CASCADE' });
Bookmark.belongsTo(SharedNote, { foreignKey: 'noteId' });

// Notifications
User.hasMany(Notification, { foreignKey: 'userId', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId' });

// Challenges
Group.hasMany(Challenge, { foreignKey: 'groupId', onDelete: 'CASCADE' });
Challenge.belongsTo(Group, { foreignKey: 'groupId' });
User.hasMany(Challenge, { foreignKey: 'createdBy', as: 'CreatedChallenges' });
Challenge.belongsTo(User, { foreignKey: 'createdBy', as: 'Creator' });

// Mentor Ratings
User.hasMany(MentorRating, { as: 'MentorRatings', foreignKey: 'mentorId', onDelete: 'CASCADE' });
MentorRating.belongsTo(User, { as: 'Mentor', foreignKey: 'mentorId' });
User.hasMany(MentorRating, { as: 'GivenRatings', foreignKey: 'studentId', onDelete: 'CASCADE' });
MentorRating.belongsTo(User, { as: 'Student', foreignKey: 'studentId' });

module.exports = {
  sequelize,
  User,
  Group,
  GroupMember,
  Note,
  Session,
  Progress,
  Doubt,
  Answer,
  SharedNote,
  Bookmark,
  Otp,
  Notification,
  Challenge,
  MentorRating
};


