const express = require('express');
const { Doubt, Answer, User, GroupMember, Group, Notification } = require('../models');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get doubts in a group
router.get('/group/:groupId', authMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params;

    const isMember = await GroupMember.findOne({
      where: { userId: req.user.id, groupId }
    });
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied. You must be a member of this study circle.' });
    }

    const doubts = await Doubt.findAll({
      where: { groupId },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'Author',
          attributes: ['fullName', 'username', 'role']
        },
        {
          model: Answer,
          attributes: ['id', 'isAccepted']
        }
      ]
    });

    return res.json({ doubts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error retrieving doubts.' });
  }
});

// Create academic doubt
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { groupId, title, description, tags } = req.body;
    if (!groupId || !title || !description) {
      return res.status(400).json({ error: 'Group ID, Title, and Description are required.' });
    }

    const isMember = await GroupMember.findOne({
      where: { userId: req.user.id, groupId }
    });
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied. You must be a member of this study circle.' });
    }

    const doubt = await Doubt.create({
      groupId,
      title,
      description,
      tags: tags || '',
      userId: req.user.id,
      upvotes: 0,
      isSolved: false
    });

    // Fetch author details for the client
    const fullDoubt = await Doubt.findByPk(doubt.id, {
      include: [{
        model: User,
        as: 'Author',
        attributes: ['fullName', 'username', 'role']
      }]
    });

    try {
      const group = await Group.findByPk(groupId);
      const groupName = group ? group.name : 'Study Circle';
      
      const members = await GroupMember.findAll({ where: { groupId } });
      const notificationsToCreate = members
        .filter(m => m.userId !== req.user.id)
        .map(m => ({
          userId: m.userId,
          message: `${req.user.fullName} posted a new doubt: "${title}" in ${groupName}`,
          type: 'doubt',
          unread: true,
          groupName,
          actionTab: 'doubts'
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
      console.error('[Notifier] Error sending doubt notifications:', notifErr);
    }

    return res.status(201).json({ message: 'Doubt posted successfully!', doubt: fullDoubt });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error posting doubt.' });
  }
});

// Get doubt details and answers
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const doubt = await Doubt.findByPk(id, {
      include: [
        {
          model: User,
          as: 'Author',
          attributes: ['fullName', 'username', 'role']
        }
      ]
    });

    if (!doubt) {
      return res.status(404).json({ error: 'Doubt not found.' });
    }

    // Verify membership
    const isMember = await GroupMember.findOne({
      where: { userId: req.user.id, groupId: doubt.groupId }
    });
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const answers = await Answer.findAll({
      where: { doubtId: id },
      order: [['isAccepted', 'DESC'], ['upvotes', 'DESC'], ['createdAt', 'ASC']],
      include: [{
        model: User,
        as: 'Author',
        attributes: ['fullName', 'username', 'role']
      }]
    });

    return res.json({ doubt, answers });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error retrieving doubt details.' });
  }
});

// Post an answer to a doubt
router.post('/:id/answers', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Answer content is required.' });
    }

    const doubt = await Doubt.findByPk(id);
    if (!doubt) {
      return res.status(404).json({ error: 'Doubt not found.' });
    }

    // Verify membership
    const isMember = await GroupMember.findOne({
      where: { userId: req.user.id, groupId: doubt.groupId }
    });
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const answer = await Answer.create({
      doubtId: id,
      content,
      userId: req.user.id,
      upvotes: 0,
      isAccepted: false
    });

    const fullAnswer = await Answer.findByPk(answer.id, {
      include: [{
        model: User,
        as: 'Author',
        attributes: ['fullName', 'username', 'role']
      }]
    });

    try {
      if (doubt.userId !== req.user.id) {
        const group = await Group.findByPk(doubt.groupId);
        const groupName = group ? group.name : 'Study Circle';
        const notification = await Notification.create({
          userId: doubt.userId,
          message: `${req.user.fullName} answered your doubt: "${doubt.title}" in ${groupName}`,
          type: 'doubt',
          unread: true,
          groupName,
          actionTab: 'doubts'
        });
        
        const io = req.app.get('io');
        if (io) {
          io.to(`user-${doubt.userId}`).emit('new-notification', notification);
        }
      }
    } catch (notifErr) {
      console.error('[Notifier] Error sending answer notification:', notifErr);
    }

    return res.status(201).json({ message: 'Answer posted successfully!', answer: fullAnswer });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error posting answer.' });
  }
});

// Upvote a doubt
router.put('/:id/upvote', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const doubt = await Doubt.findByPk(id);
    if (!doubt) {
      return res.status(404).json({ error: 'Doubt not found.' });
    }

    doubt.upvotes = (doubt.upvotes || 0) + 1;
    await doubt.save();

    return res.json({ message: 'Doubt upvoted successfully!', upvotes: doubt.upvotes });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error upvoting doubt.' });
  }
});

// Upvote an answer
router.put('/answers/:answerId/upvote', authMiddleware, async (req, res) => {
  try {
    const { answerId } = req.params;
    const answer = await Answer.findByPk(answerId);
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found.' });
    }

    answer.upvotes = (answer.upvotes || 0) + 1;
    await answer.save();

    return res.json({ message: 'Answer upvoted successfully!', upvotes: answer.upvotes });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error upvoting answer.' });
  }
});

// Accept an answer (mark doubt as solved)
router.put('/answers/:answerId/accept', authMiddleware, async (req, res) => {
  try {
    const { answerId } = req.params;
    const answer = await Answer.findByPk(answerId);
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found.' });
    }

    const doubt = await Doubt.findByPk(answer.doubtId);
    if (!doubt) {
      return res.status(404).json({ error: 'Doubt not found.' });
    }

    // Security check: only the author of the doubt can accept an answer
    if (doubt.userId !== req.user.id) {
      return res.status(403).json({ error: 'Permission denied. Only the author of the doubt can accept an answer.' });
    }

    // Reset all other answers' acceptance for this doubt, if any
    await Answer.update({ isAccepted: false }, { where: { doubtId: doubt.id } });

    // Mark this answer as accepted
    answer.isAccepted = true;
    await answer.save();

    // Mark doubt as solved
    doubt.isSolved = true;
    await doubt.save();

    return res.json({ message: 'Answer accepted and doubt marked as solved!', answer, doubt });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error accepting answer.' });
  }
});

module.exports = router;
