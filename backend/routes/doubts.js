const express = require('express');
const { Doubt, Answer, User, GroupMember, Group, Notification } = require('../models');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all doubts (Open to all roles)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const doubts = await Doubt.findAll({
      order: [
        ['isPinned', 'DESC'],
        ['createdAt', 'DESC']
      ],
      include: [
        {
          model: User,
          as: 'Author',
          attributes: ['fullName', 'username', 'role']
        },
        {
          model: Group,
          attributes: ['name']
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
    const { groupId, title, description, tags, subject, topic } = req.body;
    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Question description is required.' });
    }

    if (groupId) {
      const isMember = await GroupMember.findOne({
        where: { userId: req.user.id, groupId }
      });
      if (!isMember) {
        return res.status(403).json({ error: 'Access denied. You must be a member of this study circle.' });
      }
    }

    const doubt = await Doubt.create({
      groupId: groupId || null,
      title: title || subject || 'General Academic Doubt',
      description: description.trim(),
      tags: tags || '',
      userId: req.user.id,
      upvotes: 0,
      isSolved: false,
      subject: subject ? subject.trim() : null,
      topic: topic ? topic.trim() : null
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
      if (groupId) {
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

    // Update active circle challenges of type doubts_solved
    try {
      const { Challenge } = require('../models');
      const activeChallenges = await Challenge.findAll({
        where: { groupId: doubt.groupId, targetType: 'doubts_solved', status: 'active' }
      });
      for (const challenge of activeChallenges) {
        challenge.currentProgress = (challenge.currentProgress || 0) + 1;
        await challenge.save();
      }
    } catch (challengeErr) {
      console.error('Failed to update challenges on doubt accept:', challengeErr);
    }

    return res.json({ message: 'Answer accepted and doubt marked as solved!', answer, doubt });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error accepting answer.' });
  }
});

// Solve status toggle (Mentor/Admin/Author only)
router.put('/:id/solve', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const doubt = await Doubt.findByPk(id);
    if (!doubt) {
      return res.status(404).json({ error: 'Doubt not found.' });
    }

    if (req.user.role !== 'mentor' && req.user.role !== 'admin' && req.user.id !== doubt.userId) {
      return res.status(403).json({ error: 'Permission denied.' });
    }

    doubt.isSolved = !doubt.isSolved;
    await doubt.save();
    return res.json({ message: doubt.isSolved ? 'Doubt marked as resolved!' : 'Doubt marked as unresolved!', doubt });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error updating solved status.' });
  }
});

// Pin status toggle (Mentor/Admin only)
router.put('/:id/pin', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== 'mentor' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Permission denied. Mentors or Administrators privileges required.' });
    }

    const doubt = await Doubt.findByPk(id);
    if (!doubt) {
      return res.status(404).json({ error: 'Doubt not found.' });
    }

    doubt.isPinned = !doubt.isPinned;
    await doubt.save();
    return res.json({ message: doubt.isPinned ? 'Discussion pinned successfully!' : 'Discussion unpinned successfully!', doubt });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error updating pin status.' });
  }
});

// Close status toggle (Mentor/Admin only)
router.put('/:id/close', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== 'mentor' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Permission denied. Mentors or Administrators privileges required.' });
    }

    const doubt = await Doubt.findByPk(id);
    if (!doubt) {
      return res.status(404).json({ error: 'Doubt not found.' });
    }

    doubt.isClosed = !doubt.isClosed;
    await doubt.save();
    return res.json({ message: doubt.isClosed ? 'Discussion closed successfully!' : 'Discussion opened successfully!', doubt });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error updating close status.' });
  }
});

// Edit own doubt
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, topic, description, title } = req.body;

    const doubt = await Doubt.findByPk(id);
    if (!doubt) {
      return res.status(404).json({ error: 'Doubt not found.' });
    }

    // Security check: only the author can edit their own doubt
    if (doubt.userId !== req.user.id) {
      return res.status(403).json({ error: 'Permission denied. You can only edit your own doubt.' });
    }

    if (subject !== undefined) doubt.subject = subject ? subject.trim() : null;
    if (topic !== undefined) doubt.topic = topic ? topic.trim() : null;
    if (title !== undefined) doubt.title = title ? title.trim() : (subject || doubt.title);
    if (description !== undefined) {
      if (!description.trim()) {
        return res.status(400).json({ error: 'Question description cannot be empty.' });
      }
      doubt.description = description.trim();
    }

    await doubt.save();

    // Fetch author details for the client response
    const fullDoubt = await Doubt.findByPk(doubt.id, {
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

    return res.json({ message: 'Doubt updated successfully!', doubt: fullDoubt });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error updating doubt.' });
  }
});

// Delete own doubt
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const doubt = await Doubt.findByPk(id);
    if (!doubt) {
      return res.status(404).json({ error: 'Doubt not found.' });
    }

    // Security check: only the author or admin can delete a doubt
    if (doubt.userId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'mentor') {
      return res.status(403).json({ error: 'Permission denied. You can only delete your own doubt.' });
    }

    await doubt.destroy();
    return res.json({ message: 'Doubt deleted successfully!' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error deleting doubt.' });
  }
});

module.exports = router;
