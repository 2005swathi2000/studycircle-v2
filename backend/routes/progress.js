const express = require('express');
const { Progress, User, GroupMember, sequelize } = require('../models');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get stats for current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['streakCount', 'totalStudyHours']
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.json({
      streakCount: user.streakCount || 0,
      totalStudyHours: user.totalStudyHours || 0.0
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error retrieving progress.' });
  }
});

// Log study progress
router.post('/log', authMiddleware, async (req, res) => {
  try {
    const { groupId, studyMinutes, notesCreated, tasksCompleted } = req.body;
    if (!groupId || !studyMinutes) {
      return res.status(400).json({ error: 'Group ID and Study minutes are required.' });
    }

    const membership = await GroupMember.findOne({
      where: { userId: req.user.id, groupId }
    });
    if (!membership) {
      return res.status(403).json({ error: 'Access denied. You must be a member of this group.' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Log progress entry
    const progress = await Progress.create({
      userId: req.user.id,
      groupId,
      studyMinutes: Number(studyMinutes),
      notesCreated: Number(notesCreated || 0),
      tasksCompleted: Number(tasksCompleted || 0)
    });

    // Update study hours
    const hours = Number(studyMinutes) / 60.0;
    user.totalStudyHours = Number((user.totalStudyHours + hours).toFixed(2));

    // Simple streak logic: increment streak
    user.streakCount = (user.streakCount || 0) + 1;
    await user.save();

    return res.json({
      message: 'Progress logged successfully!',
      progress,
      user: {
        id: user.id,
        streakCount: user.streakCount,
        totalStudyHours: user.totalStudyHours
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error logging progress.' });
  }
});

// Get group leaderboard
router.get('/group/:groupId/leaderboard', authMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params;

    const isMember = await GroupMember.findOne({
      where: { userId: req.user.id, groupId }
    });
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied. You must be a member of this study circle.' });
    }

    // Fetch members and sort by total study hours
    const members = await GroupMember.findAll({
      where: { groupId },
      include: [{
        model: User,
        attributes: ['id', 'fullName', 'username', 'role', 'streakCount', 'totalStudyHours']
      }]
    });

    const leaderboard = members
      .map(m => m.User)
      .filter(Boolean)
      .sort((a, b) => b.totalStudyHours - a.totalStudyHours);

    return res.json({ leaderboard });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error retrieving leaderboard.' });
  }
});

// Get group logs
router.get('/group/:groupId/logs', authMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params;

    const isMember = await GroupMember.findOne({
      where: { userId: req.user.id, groupId }
    });
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied. You must be a member of this study circle.' });
    }

    const logs = await Progress.findAll({
      where: { groupId },
      order: [['createdAt', 'DESC']],
      limit: 20,
      include: [{
        model: User,
        attributes: ['fullName', 'username']
      }]
    });

    return res.json({ logs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error retrieving logs.' });
  }
});

module.exports = router;
