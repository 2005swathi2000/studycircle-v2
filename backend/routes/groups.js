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

module.exports = router;
