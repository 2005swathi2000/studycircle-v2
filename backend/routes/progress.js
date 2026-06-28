const express = require('express');
const { Progress, User, GroupMember, Group, Doubt, SharedNote, sequelize } = require('../models');
const { authMiddleware } = require('../middleware/auth');
const authRoutes = require('./auth');
const { Op } = require('sequelize');

const getTodayISTString = authRoutes.getTodayISTString;
const getYesterdayISTString = authRoutes.getYesterdayISTString;
const calculateLevel = authRoutes.calculateLevel;
const getXpThresholdForLevel = authRoutes.getXpThresholdForLevel;

const decayAllStaleStreaks = async () => {
  const today = getTodayISTString();
  const yesterday = getYesterdayISTString();
  await User.update(
    { streakCount: 0 },
    {
      where: {
        streakCount: { [Op.gt]: 0 },
        lastStudyDate: {
          [Op.or]: [
            { [Op.is]: null },
            { [Op.eq]: '' },
            {
              [Op.and]: [
                { [Op.ne]: today },
                { [Op.ne]: yesterday }
              ]
            }
          ]
        }
      }
    }
  );
};

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

    // Update active circle challenges of type study_hours
    try {
      const { Challenge } = require('../models');
      const activeChallenges = await Challenge.findAll({
        where: { groupId, targetType: 'study_hours', status: 'active' }
      });
      for (const challenge of activeChallenges) {
        challenge.currentProgress = Number(((challenge.currentProgress || 0) + hours).toFixed(2));
        await challenge.save();
      }
    } catch (challengeErr) {
      console.error('Failed to update challenges on progress log:', challengeErr);
    }

    // Streak logic: check daily consistency
    const todayStr = getTodayISTString();
    const yesterdayStr = getYesterdayISTString();
    const lastStudy = user.lastStudyDate || '';

    if (lastStudy === todayStr) {
      // Already studied today, keep streak as is, do not increment
    } else if (lastStudy === yesterdayStr) {
      // Studied yesterday, increment streak
      user.streakCount = (user.streakCount || 0) + 1;
      user.lastStudyDate = todayStr;
    } else {
      // Streak broken, reset to 1
      user.streakCount = 1;
      user.lastStudyDate = todayStr;
    }
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
    await decayAllStaleStreaks();
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
        attributes: ['id', 'fullName', 'username', 'role', 'streakCount', 'totalStudyHours', 'avatarUrl', 'gender']
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

// Helper: award XP and Coins with Daily Limit enforcement
const awardUserXpAndCoins = async (user, xpToAward, coinsToAward) => {
  const DAILY_XP_LIMIT = 500;
  const remainingXpCapacity = Math.max(0, DAILY_XP_LIMIT - (user.dailyXpEarned || 0));
  const actualXpAwarded = Math.min(xpToAward, remainingXpCapacity);
  
  user.dailyXpEarned = (user.dailyXpEarned || 0) + actualXpAwarded;
  user.xp = (user.xp || 0) + actualXpAwarded;
  user.focusCoins = (user.focusCoins || 0) + coinsToAward;
  
  const oldLevel = user.level || 1;
  const newLevel = calculateLevel(user.xp);
  let leveledUp = false;
  if (newLevel > oldLevel) {
    user.level = newLevel;
    leveledUp = true;
  }
  
  await user.save();
  return { actualXpAwarded, leveledUp };
};

// Helper: check and award daily/milestone streak badges
const checkAndAwardStreakBadges = (user) => {
  let badges = [];
  try {
    badges = JSON.parse(user.badges || '[]');
  } catch (e) {
    badges = [];
  }
  
  let awarded = false;
  const streak = user.streakCount || 0;
  const todayIST = getTodayISTString();
  
  const addBadge = (badgeId, badgeName) => {
    if (!badges.some(b => b.id === badgeId)) {
      badges.push({ id: badgeId, earnedAt: todayIST, name: badgeName });
      awarded = true;
    }
  };
  
  if (streak >= 3) {
    addBadge('bronze_streak', 'Bronze Streak Badge (3 Days)');
  }
  if (streak >= 7) {
    addBadge('silver_streak', 'Silver Streak Badge (7 Days)');
  }
  if (streak >= 30) {
    addBadge('gold_streak', 'Gold Streak Badge (30 Days)');
  }
  if (streak >= 100) {
    addBadge('diamond_streak', 'Diamond Streak Badge (100 Days)');
  }
  
  if (awarded) {
    user.badges = JSON.stringify(badges);
  }
  return awarded;
};

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

    const { actualXpAwarded, leveledUp } = await awardUserXpAndCoins(user, Number(xpReward || 50), Number(coinReward || 20));

    return res.json({
      message: `Mission '${missionId}' claimed!`,
      xp: user.xp,
      focusCoins: user.focusCoins,
      level: user.level,
      leveledUp,
      actualXpAwarded
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error claiming mission.' });
  }
});

// Purchase Custom Themes / Avatars / Badges (Coins Marketplace)
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

    // Save as future-proof badge object: { id, earnedAt, name }
    let currentBadges = [];
    try {
      currentBadges = JSON.parse(user.badges || '[]');
    } catch (e) {
      currentBadges = [];
    }

    const todayIST = getTodayISTString();
    if (!currentBadges.some(b => b.id === rewardId)) {
      currentBadges.push({
        id: rewardId,
        earnedAt: todayIST,
        name: value
      });
      user.badges = JSON.stringify(currentBadges);
    }

    await user.save();

    return res.json({
      message: `Successfully unlocked ${value}!`,
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

    const { actualXpAwarded, leveledUp } = await awardUserXpAndCoins(user, Number(xpReward), Number(coinReward));

    // Streak logic: check daily consistency
    const todayStr = getTodayISTString();
    const yesterdayStr = getYesterdayISTString();
    const lastStudy = user.lastStudyDate || '';

    if (lastStudy === todayStr) {
      // Already studied today, keep streak as is, do not increment
    } else if (lastStudy === yesterdayStr) {
      // Studied yesterday, increment streak
      user.streakCount = (user.streakCount || 0) + 1;
      user.lastStudyDate = todayStr;
    } else {
      // Streak broken, reset to 1
      user.streakCount = 1;
      user.lastStudyDate = todayStr;
    }

    // Check and award badges
    const badgesUpdated = checkAndAwardStreakBadges(user);

    await user.save();

    return res.json({
      message: 'Practice challenge completed successfully!',
      xp: user.xp,
      focusCoins: user.focusCoins,
      level: user.level,
      streakCount: user.streakCount,
      leveledUp,
      actualXpAwarded,
      badges: user.badges
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error saving practice progress.' });
  }
});

// Award credits for client action events with anti-abuse limits/cooldowns
router.post('/award-credits', authMiddleware, async (req, res) => {
  try {
    const { action } = req.body;
    if (!action) {
      return res.status(400).json({ error: 'Action parameter is required.' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    let coinsToAward = 0;
    let xpToAward = 0;
    let message = '';

    if (action === 'join_session') {
      // 30-minute anti-abuse cooldown check
      if (user.lastSessionXpAwardedAt) {
        const timeSinceAward = Date.now() - new Date(user.lastSessionXpAwardedAt).getTime();
        const thirtyMinutes = 30 * 60 * 1000;
        if (timeSinceAward < thirtyMinutes) {
          return res.json({
            message: 'Session rewards on cooldown (30 minutes max frequency).',
            cooldownRemaining: Math.ceil((thirtyMinutes - timeSinceAward) / 60000),
            focusCoins: user.focusCoins,
            xp: user.xp,
            level: user.level,
            leveledUp: false,
            actualXpAwarded: 0
          });
        }
      }
      coinsToAward = 10;
      xpToAward = 10;
      user.lastSessionXpAwardedAt = new Date();
      message = 'Earned study credits for joining session!';
    } else if (action === 'upload_notes') {
      coinsToAward = 20;
      xpToAward = 20;
      message = 'Earned study credits for sharing study notes!';
    } else if (action === 'help_doubts') {
      coinsToAward = 30;
      xpToAward = 30;
      message = 'Earned study credits for helping resolve a doubt!';
    } else if (action === 'daily_login') {
      coinsToAward = 5;
      xpToAward = 5;
      message = 'Daily login bonus awarded!';
    } else {
      return res.status(400).json({ error: 'Invalid credit award action.' });
    }

    const { actualXpAwarded, leveledUp } = await awardUserXpAndCoins(user, xpToAward, coinsToAward);

    return res.json({
      message,
      focusCoins: user.focusCoins,
      xp: user.xp,
      level: user.level,
      leveledUp,
      actualXpAwarded
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error awarding credits.' });
  }
});

// GET /api/progress/global-leaderboards (Dynamically queries the DB to avoid stale stored values)
router.get('/global-leaderboards', authMiddleware, async (req, res) => {
  try {
    await decayAllStaleStreaks();
    const topLearners = await User.findAll({
      where: { role: 'student' },
      attributes: ['id', 'fullName', 'username', 'avatarUrl', 'gender', 'totalStudyHours', 'streakCount', 'level'],
      order: [['totalStudyHours', 'DESC']],
      limit: 10
    });

    const topMentors = await User.findAll({
      where: { role: { [Op.or]: ['mentor', 'admin'] } },
      attributes: ['id', 'fullName', 'username', 'avatarUrl', 'gender', 'xp', 'totalStudyHours'],
      order: [['xp', 'DESC']],
      limit: 10
    });

    const helpfulNotes = await SharedNote.findAll({
      attributes: ['id', 'name', 'size', 'type', 'publishedBy', 'createdAt'],
      limit: 10
    });

    const topDoubts = await Doubt.findAll({
      attributes: ['id', 'title', 'upvotes', 'isSolved'],
      include: [{ model: User, as: 'Author', attributes: ['fullName', 'username'] }],
      order: [['upvotes', 'DESC']],
      limit: 10
    });

    const activeRooms = await Group.findAll({
      attributes: ['id', 'name', 'description', 'subject', 'isPublic', 'inviteCode'],
      include: [{
        model: GroupMember,
        attributes: ['id']
      }],
      limit: 10
    });

    const formattedRooms = activeRooms.map(room => {
      return {
        id: room.id,
        name: room.name,
        description: room.description,
        subject: room.subject,
        isPublic: room.isPublic,
        inviteCode: room.inviteCode,
        memberCount: room.GroupMembers ? room.GroupMembers.length : 0
      };
    }).sort((a, b) => b.memberCount - a.memberCount);

    return res.json({
      learners: topLearners,
      mentors: topMentors,
      notes: helpfulNotes,
      doubts: topDoubts,
      rooms: formattedRooms
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error retrieving global leaderboards.' });
  }
});

// POST /api/progress/update-missions
router.post('/update-missions', authMiddleware, async (req, res) => {
  try {
    const { dailyMissions } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    user.dailyMissions = dailyMissions;
    await user.save();
    return res.json({
      message: 'Missions updated successfully.',
      user: {
        id: user.id,
        dailyMissions: user.dailyMissions
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error updating missions.' });
  }
});

module.exports = router;

