const express = require('express');
const { Session, User, GroupMember, Group, Notification } = require('../models');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all academic sessions
router.get('/', authMiddleware, async (req, res) => {
  try {
    const sessions = await Session.findAll({
      order: [['scheduledAt', 'ASC']],
      include: [
        {
          model: User,
          as: 'Creator',
          attributes: ['fullName', 'username']
        },
        {
          model: Group,
          attributes: ['name']
        }
      ]
    });
    return res.json({ sessions });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error retrieving sessions.' });
  }
});

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

    // Any member of the group can schedule study sessions to foster student collaboration
    if (!membership && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. You must be a member of this study circle.' });
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

    try {
      const group = await Group.findByPk(groupId);
      const groupName = group ? group.name : 'Study Circle';
      
      const members = await GroupMember.findAll({ where: { groupId } });
      const notificationsToCreate = members
        .filter(m => m.userId !== req.user.id)
        .map(m => ({
          userId: m.userId,
          message: `New session scheduled: "${title}" in ${groupName}`,
          type: 'session',
          unread: true,
          groupName,
          actionTab: 'sessions'
        }));

      if (notificationsToCreate.length > 0) {
        const createdNotifications = await Notification.bulkCreate(notificationsToCreate);
        const io = req.app.get('io');
        if (io) {
          createdNotifications.forEach(notification => {
            io.to(`user-${notification.userId}`).emit('new-notification', notification);
          });
        }
      }
    } catch (notifErr) {
      console.error('[Notifier] Error sending session notifications:', notifErr);
    }

    return res.status(201).json({ message: 'Session scheduled successfully!', session });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error scheduling session.' });
  }
});

// Edit session
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, scheduledAt, durationMinutes, meetingLink } = req.body;
    
    const session = await Session.findByPk(id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    if (session.createdBy !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'mentor') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    if (title) session.title = title;
    if (description !== undefined) session.description = description;
    if (scheduledAt) session.scheduledAt = scheduledAt;
    if (durationMinutes) session.durationMinutes = Number(durationMinutes);
    if (meetingLink !== undefined) session.meetingLink = meetingLink;

    await session.save();
    return res.json({ message: 'Session updated successfully!', session });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error updating session.' });
  }
});

// Cancel/Delete session
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const session = await Session.findByPk(id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    if (session.createdBy !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'mentor') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    await session.destroy();
    return res.json({ message: 'Session cancelled successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error cancelling session.' });
  }
});

module.exports = router;
