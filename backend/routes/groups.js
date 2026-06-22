const express = require('express');
const { Group, GroupMember, User, Note, Session } = require('../models');
const { authMiddleware } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Get all public groups (No Auth Required)
router.get('/public-list', async (req, res) => {
  try {
    const publicGroups = await Group.findAll({
      where: { isPublic: true },
      attributes: ['id', 'name', 'description', 'subject', 'inviteCode', 'createdAt']
    });
    return res.json({ groups: publicGroups });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error fetching public groups.' });
  }
});

// Get Group Preview Info by Invite Code (Public - No Auth Required)
router.get('/preview/:inviteCode', async (req, res) => {
  try {
    const { inviteCode } = req.params;
    if (!inviteCode) {
      return res.status(400).json({ error: 'Invite code is required.' });
    }

    const group = await Group.findOne({
      where: { inviteCode: inviteCode.toLowerCase() }
    });

    if (!group) {
      return res.status(404).json({ error: 'Study group not found.' });
    }

    const memberCount = await GroupMember.count({ where: { groupId: group.id } });
    const noteCount = await Note.count({ where: { groupId: group.id } });
    const sessionCount = await Session.count({ where: { groupId: group.id } });

    const members = await GroupMember.findAll({
      where: { groupId: group.id },
      limit: 3,
      include: [{
        model: User,
        attributes: ['fullName', 'role', 'streakCount']
      }]
    });

    return res.json({
      group: {
        id: group.id,
        name: group.name,
        description: group.description,
        subject: group.subject,
        isPublic: group.isPublic,
        inviteCode: group.inviteCode,
        createdAt: group.createdAt
      },
      stats: {
        memberCount,
        noteCount,
        sessionCount,
        topicCount: 0
      },
      members: members.map(m => ({
        fullName: m.User ? m.User.fullName : 'Anonymous Student',
        role: m.role,
        streakCount: m.User ? m.User.streakCount : 0
      }))
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error retrieving group preview.' });
  }
});

// Create a Study Group (Authenticated)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, subject, isPublic } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Group name is required.' });
    }

    const newGroup = await Group.create({
      name,
      description,
      subject,
      isPublic: isPublic !== undefined ? isPublic : true
    });

    // Creator joins as admin
    await GroupMember.create({
      userId: req.user.id,
      groupId: newGroup.id,
      role: 'admin'
    });

    return res.status(201).json({
      message: 'Group created successfully!',
      group: newGroup
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error while creating group.' });
  }
});

// Join Group using Invite Code (Authenticated)
router.post('/join', authMiddleware, async (req, res) => {
  try {
    const { inviteCode } = req.body;
    if (!inviteCode) {
      return res.status(400).json({ error: 'Invite code is required.' });
    }

    const group = await Group.findOne({ where: { inviteCode: inviteCode.toLowerCase() } });
    if (!group) {
      return res.status(404).json({ error: 'Group not found with this invite code.' });
    }

    const existingMember = await GroupMember.findOne({
      where: { userId: req.user.id, groupId: group.id }
    });

    if (existingMember) {
      return res.status(400).json({ error: 'You are already a member of this study group.' });
    }

    await GroupMember.create({
      userId: req.user.id,
      groupId: group.id,
      role: 'student'
    });

    return res.status(200).json({
      message: 'Successfully joined the study group!',
      group
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error while joining group.' });
  }
});

// Get all groups current user is part of (Authenticated)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{
        model: Group,
        through: { attributes: ['role'] }
      }]
    });

    return res.json({ groups: user ? user.Groups : [] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error fetching groups.' });
  }
});

// Get members list for a group (Authenticated)
router.get('/:id/members', authMiddleware, async (req, res) => {
  try {
    const groupId = req.params.id;

    const isMember = await GroupMember.findOne({
      where: { userId: req.user.id, groupId }
    });

    if (!isMember) {
      return res.status(403).json({ error: 'Access denied. You are not a member of this group.' });
    }

    const members = await GroupMember.findAll({
      where: { groupId },
      include: [{
        model: User,
        attributes: ['id', 'fullName', 'username', 'role', 'streakCount', 'totalStudyHours']
      }]
    });

    return res.json({ members });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error fetching group members.' });
  }
});

// Get all public groups current user is NOT part of (Lobby workspaces)
router.get('/available', authMiddleware, async (req, res) => {
  try {
    const myMemberships = await GroupMember.findAll({
      where: { userId: req.user.id },
      attributes: ['groupId']
    });
    const myGroupIds = myMemberships.map(m => m.groupId);

    const availableGroups = await Group.findAll({
      where: {
        isPublic: true,
        id: { [Op.notIn]: myGroupIds.length > 0 ? myGroupIds : [''] }
      }
    });

    return res.json({ groups: availableGroups });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error fetching available public groups.' });
  }
});

// Join public group directly without invite code
router.post('/:id/join-public', authMiddleware, async (req, res) => {
  try {
    const groupId = req.params.id;
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found.' });
    }

    if (!group.isPublic) {
      return res.status(400).json({ error: 'This study group is private. An invitation code is required to join.' });
    }

    const existingMember = await GroupMember.findOne({
      where: { userId: req.user.id, groupId }
    });

    if (existingMember) {
      return res.status(400).json({ error: 'You are already a member of this study group.' });
    }

    await GroupMember.create({
      userId: req.user.id,
      groupId: group.id,
      role: 'student'
    });

    return res.json({
      message: 'Successfully joined public study group!',
      group
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error while joining public group.' });
  }
});

// Get/Create study group by slug (Authenticated)
router.get('/by-slug/:slug', authMiddleware, async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      return res.status(400).json({ error: 'Slug is required.' });
    }

    const SLUG_MAP = {
      'programming-dsa': {
        name: 'Programming & DSA Room',
        subject: 'Programming & DSA',
        description: 'Perfect for beginners. Practice coding, algorithms, and data structures.'
      },
      'ai-ml': {
        name: 'AI & Machine Learning Room',
        subject: 'AI & Machine Learning',
        description: 'Explore neural networks, machine learning models, and intelligent systems.'
      },
      'web-development': {
        name: 'Web Development Room',
        subject: 'Web Development',
        description: 'Build modern web applications, APIs, interfaces, and study web technologies.'
      },
      'aptitude': {
        name: 'Aptitude Room',
        subject: 'Aptitude',
        description: 'Prepare for competitive exams and practice aptitude questions.'
      },
      'interview-preparation': {
        name: 'Interview Preparation Room',
        subject: 'Interview Preparation',
        description: 'Prepare for technical interviews and behavior rounds.'
      },
      'gate': {
        name: 'GATE Room',
        subject: 'GATE',
        description: 'Prepare for the Graduate Aptitude Test in Engineering.'
      },
      'upsc': {
        name: 'UPSC Room',
        subject: 'UPSC',
        description: 'Study for the Civil Services Examination together.'
      },
      'mathematics': {
        name: 'Mathematics Room',
        subject: 'Mathematics',
        description: 'Deep dive into calculus, linear algebra, and discrete mathematics.'
      }
    };

    const config = SLUG_MAP[slug];
    const targetSubject = config?.subject || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const targetName = config?.name || `${targetSubject} Room`;
    const targetDescription = config?.description || `Interactive workspace for ${targetSubject}.`;

    // Find group
    let group = await Group.findOne({
      where: {
        [Op.or]: [
          { name: targetName },
          { subject: targetSubject }
        ]
      }
    });

    if (!group) {
      group = await Group.create({
        name: targetName,
        subject: targetSubject,
        description: targetDescription,
        isPublic: true
      });
    }

    // Auto-join the user
    const member = await GroupMember.findOne({
      where: { userId: req.user.id, groupId: group.id }
    });

    if (!member) {
      await GroupMember.create({
        userId: req.user.id,
        groupId: group.id,
        role: 'student'
      });
    }

    // Get statistics
    const memberCount = await GroupMember.count({ where: { groupId: group.id } });
    const noteCount = await Note.count({ where: { groupId: group.id } });
    const sessionCount = await Session.count({ where: { groupId: group.id } });

    const members = await GroupMember.findAll({
      where: { groupId: group.id },
      limit: 3,
      include: [{
        model: User,
        attributes: ['fullName', 'role', 'streakCount']
      }]
    });

    return res.json({
      group,
      stats: {
        memberCount,
        noteCount,
        sessionCount,
        topicCount: 0
      },
      members: members.map(m => ({
        fullName: m.User ? m.User.fullName : 'Anonymous Student',
        role: m.role,
        streakCount: m.User ? m.User.streakCount : 0
      }))
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error retrieving group by slug.' });
  }
});

// GET /api/groups/:groupId/challenges
router.get('/:groupId/challenges', authMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params;

    const isMember = await GroupMember.findOne({
      where: { userId: req.user.id, groupId }
    });
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied. You must be a member of this study circle.' });
    }

    const { Challenge } = require('../models');
    const challenges = await Challenge.findAll({
      where: { groupId },
      order: [['createdAt', 'DESC']]
    });

    return res.json({ challenges });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error retrieving group challenges.' });
  }
});

// POST /api/groups/:groupId/challenges
router.post('/:groupId/challenges', authMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { title, description, targetType, targetValue, xpReward, coinReward, deadline } = req.body;

    const isMember = await GroupMember.findOne({
      where: { userId: req.user.id, groupId }
    });
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied. You must be a member of this study circle.' });
    }

    const canCreate = req.user.role === 'mentor' || req.user.role === 'admin' || isMember.role === 'admin';
    if (!canCreate) {
      return res.status(403).json({ error: 'Access denied. Only mentors or admins can create challenges.' });
    }

    if (!title || !targetType || !targetValue) {
      return res.status(400).json({ error: 'Title, target type, and target value are required.' });
    }

    if (!['study_hours', 'notes_uploaded', 'doubts_solved'].includes(targetType)) {
      return res.status(400).json({ error: 'Invalid target type.' });
    }

    const { Challenge } = require('../models');
    const challenge = await Challenge.create({
      groupId,
      title,
      description,
      targetType,
      targetValue: Number(targetValue),
      currentProgress: 0.0,
      xpReward: Number(xpReward || 150),
      coinReward: Number(coinReward || 50),
      status: 'active',
      deadline: deadline ? new Date(deadline) : null,
      createdBy: req.user.id
    });

    return res.status(201).json({
      message: 'Circle challenge created successfully!',
      challenge
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error creating circle challenge.' });
  }
});

// POST /api/groups/:groupId/challenges/:challengeId/claim
router.post('/:groupId/challenges/:challengeId/claim', authMiddleware, async (req, res) => {
  try {
    const { groupId, challengeId } = req.params;

    const isMember = await GroupMember.findOne({
      where: { userId: req.user.id, groupId }
    });
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied. You must be a member of this study circle.' });
    }

    const { Challenge, User } = require('../models');
    const challenge = await Challenge.findOne({
      where: { id: challengeId, groupId }
    });

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found.' });
    }

    if (challenge.currentProgress < challenge.targetValue) {
      return res.status(400).json({ error: 'Challenge goals have not been fully achieved yet.' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const DAILY_XP_LIMIT = 500;
    const remainingXpCapacity = Math.max(0, DAILY_XP_LIMIT - (user.dailyXpEarned || 0));
    const actualXpAwarded = Math.min(challenge.xpReward, remainingXpCapacity);

    user.dailyXpEarned = (user.dailyXpEarned || 0) + actualXpAwarded;
    user.xp = (user.xp || 0) + actualXpAwarded;
    user.focusCoins = (user.focusCoins || 0) + challenge.coinReward;

    // Calculate level
    const calculateLevel = (xp) => {
      let level = 1;
      while (true) {
        let totalXp = 0;
        for (let l = 1; l < level + 1; l++) {
          totalXp += Math.floor(100 * Math.pow(l, 1.3));
        }
        if (xp < totalXp) {
          break;
        }
        level++;
      }
      return level;
    };

    const oldLevel = user.level || 1;
    const newLevel = calculateLevel(user.xp);
    let leveledUp = false;
    if (newLevel > oldLevel) {
      user.level = newLevel;
      leveledUp = true;
    }

    // Add challenge badge
    let currentBadges = [];
    try {
      currentBadges = JSON.parse(user.badges || '[]');
    } catch (e) {
      currentBadges = [];
    }

    const todayIST = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    const challengeBadgeId = `challenge_${challenge.id}`;
    if (!currentBadges.some(b => b.id === challengeBadgeId)) {
      currentBadges.push({
        id: challengeBadgeId,
        earnedAt: todayIST,
        name: `${challenge.title} Champion`
      });
      user.badges = JSON.stringify(currentBadges);
    }

    await user.save();

    if (challenge.status !== 'completed') {
      challenge.status = 'completed';
      await challenge.save();
    }

    return res.json({
      message: `Successfully claimed rewards for '${challenge.title}'!`,
      xp: user.xp,
      focusCoins: user.focusCoins,
      level: user.level,
      leveledUp,
      actualXpAwarded,
      badges: user.badges
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error claiming challenge rewards.' });
  }
});

module.exports = router;
