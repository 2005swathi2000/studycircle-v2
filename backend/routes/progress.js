const express = require('express');
const { Progress, User, GroupMember, sequelize } = require('../models');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get stats for current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['streakCount', 'totalStudyHours', 'xp', 'focusCoins', 'level', 'department', 'badges']
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.json({
      streakCount: user.streakCount || 0,
      totalStudyHours: user.totalStudyHours || 0.0,
      xp: user.xp || 0,
      focusCoins: user.focusCoins || 0,
      level: user.level || 1,
      department: user.department || 'CSE',
      badges: user.badges || '[]'
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

// Claim Daily Mission Reward
router.post('/claim-mission', authMiddleware, async (req, res) => {
  try {
    const { missionId, xpReward, coinReward } = req.body;
    if (!missionId) {
      return res.status(400).json({ error: 'Mission ID is required.' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Update XP and Coins
    user.xp = (user.xp || 0) + Number(xpReward || 50);
    user.focusCoins = (user.focusCoins || 0) + Number(coinReward || 20);

    // Calculate level up: 100 XP per level
    const newLevel = Math.floor(user.xp / 100) + 1;
    let leveledUp = false;
    if (newLevel > user.level) {
      user.level = newLevel;
      leveledUp = true;
    }

    await user.save();

    return res.json({
      message: `Mission '${missionId}' claimed!`,
      xp: user.xp,
      focusCoins: user.focusCoins,
      level: user.level,
      leveledUp
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error claiming mission.' });
  }
});

// Purchase Custom Themes / Avatars / Badges
router.post('/purchase-reward', authMiddleware, async (req, res) => {
  try {
    const { rewardId, cost, type, value } = req.body;
    if (!rewardId || cost === undefined) {
      return res.status(400).json({ error: 'Reward ID and cost are required.' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.focusCoins < cost) {
      return res.status(400).json({ error: 'Insufficient Focus Coins.' });
    }

    user.focusCoins -= cost;

    // If type is a badge, add it to badges array
    if (type === 'badge') {
      let currentBadges = [];
      try {
        currentBadges = JSON.parse(user.badges || '[]');
      } catch (e) {
        currentBadges = [];
      }
      if (!currentBadges.includes(value)) {
        currentBadges.push(value);
        user.badges = JSON.stringify(currentBadges);
      }
    }

    await user.save();

    return res.json({
      message: `Successfully unlocked ${rewardId}!`,
      focusCoins: user.focusCoins,
      badges: user.badges
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error purchasing reward.' });
  }
});

// Complete a practice session/challenge for XP, Coins, and Streak
router.post('/complete-practice', authMiddleware, async (req, res) => {
  try {
    const { interest, challengeId, xpReward = 50, coinReward = 20 } = req.body;
    
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Update XP and Coins
    user.xp = (user.xp || 0) + Number(xpReward);
    user.focusCoins = (user.focusCoins || 0) + Number(coinReward);

    // Dynamic level calculation: 100 XP per level
    const newLevel = Math.floor(user.xp / 100) + 1;
    let leveledUp = false;
    if (newLevel > user.level) {
      user.level = newLevel;
      leveledUp = true;
    }

    // Streak logic: Ensure user has at least 1 day streak upon active solving
    if (!user.streakCount || user.streakCount === 0) {
      user.streakCount = 1;
    } else {
      user.streakCount += 1;
    }

    await user.save();

    return res.json({
      message: 'Practice challenge completed successfully!',
      xp: user.xp,
      focusCoins: user.focusCoins,
      level: user.level,
      streakCount: user.streakCount,
      leveledUp
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error saving practice progress.' });
  }
});

module.exports = router;

