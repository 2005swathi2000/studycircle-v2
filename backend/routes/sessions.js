const express = require('express');
const { Session, User, GroupMember } = require('../models');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get upcoming sessions for a group
router.get('/group/:groupId', authMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params;

    const isMember = await GroupMember.findOne({
      where: { userId: req.user.id, groupId }
    });
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied. You must be a member of this study circle.' });
    }

    const sessions = await Session.findAll({
      where: { groupId },
      order: [['scheduledAt', 'ASC']],
      include: [{
        model: User,
        as: 'Creator',
        attributes: ['fullName', 'username']
      }]
    });

    return res.json({ sessions });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error fetching sessions.' });
  }
});

// Schedule session (admins and mentors can do this)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { groupId, title, description, scheduledAt, durationMinutes, meetingLink } = req.body;
    if (!groupId || !title || !scheduledAt) {
      return res.status(400).json({ error: 'Group ID, Title, and Date are required.' });
    }

    const membership = await GroupMember.findOne({
      where: { userId: req.user.id, groupId }
    });
    if (!membership) {
      return res.status(403).json({ error: 'Access denied. You are not a member of this group.' });
    }

    if (membership.role !== 'admin' && membership.role !== 'mentor' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only coordinators, group admins, and mentors can schedule sessions.' });
    }

    const session = await Session.create({
      groupId,
      title,
      description,
      scheduledAt,
      durationMinutes: durationMinutes || 60,
      meetingLink,
      createdBy: req.user.id,
      status: 'upcoming'
    });

    return res.status(201).json({ message: 'Session scheduled successfully!', session });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error scheduling session.' });
  }
});

module.exports = router;
