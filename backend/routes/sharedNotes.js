const express = require('express');
const { SharedNote, User } = require('../models');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all shared notes
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notes = await SharedNote.findAll({
      order: [['createdAt', 'DESC']]
    });
    return res.json({ notes });
  } catch (err) {
    console.error('Error fetching shared notes:', err);
    return res.status(500).json({ error: 'Server error retrieving shared notes.' });
  }
});

// Create/Publish a platform-wide shared note
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, size, type } = req.body;
    
    // Check permission: only admin or mentor can publish
    if (req.user.role !== 'admin' && req.user.role !== 'mentor') {
      return res.status(403).json({ error: 'Access denied. Only Admins and Mentors can publish platform-wide shared notes.' });
    }

    if (!name || !size || !type) {
      return res.status(400).json({ error: 'Name, size, and type are required fields.' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Publisher user profile not found.' });
    }

    const roleName = req.user.role === 'admin' ? 'Admin' : 'Mentor';
    const publishedBy = `${user.fullName} (${roleName})`;

    const note = await SharedNote.create({
      name: name.trim(),
      size: size.trim(),
      type: type,
      publishedBy
    });

    return res.status(201).json({ 
      message: 'Shared note published successfully!', 
      note 
    });
  } catch (err) {
    console.error('Error creating shared note:', err);
    return res.status(500).json({ error: 'Server error publishing shared note.' });
  }
});

module.exports = router;
