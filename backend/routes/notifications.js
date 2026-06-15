const express = require('express');
const { Notification } = require('../models');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all notifications for the authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 100 // Cap at 100 to prevent db bottleneck
    });
    return res.json({ notifications });
  } catch (err) {
    console.error('[Notifications API] Error fetching notifications:', err);
    return res.status(500).json({ error: 'Server error fetching notifications.' });
  }
});

// Mark all notifications for the user as read
router.post('/mark-read', authMiddleware, async (req, res) => {
  try {
    await Notification.update(
      { unread: false },
      { where: { userId: req.user.id, unread: true } }
    );
    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    console.error('[Notifications API] Error marking all read:', err);
    return res.status(500).json({ error: 'Server error marking notifications as read.' });
  }
});

// Mark a specific notification as read
router.post('/:id/read', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOne({
      where: { id, userId: req.user.id }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found.' });
    }

    notification.unread = false;
    await notification.save();

    return res.json({ success: true, notification });
  } catch (err) {
    console.error('[Notifications API] Error marking read:', err);
    return res.status(500).json({ error: 'Server error marking notification as read.' });
  }
});

module.exports = router;
