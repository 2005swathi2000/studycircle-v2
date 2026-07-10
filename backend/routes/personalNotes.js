const express = require('express');
const { PersonalNote } = require('../models');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all personal notes for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notes = await PersonalNote.findAll({
      where: { userId: req.user.id },
      order: [['updatedAt', 'DESC']]
    });
    return res.json({ notes });
  } catch (err) {
    console.error('Error fetching personal notes:', err);
    return res.status(500).json({ error: 'Server error fetching personal notes.' });
  }
});

// Create a personal note
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, subject, topic, content } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required.' });
    }

    const note = await PersonalNote.create({
      userId: req.user.id,
      title: title.trim(),
      subject: subject ? subject.trim() : null,
      topic: topic ? topic.trim() : null,
      content: content || ''
    });

    return res.status(201).json({
      message: 'Note Saved Successfully',
      note
    });
  } catch (err) {
    console.error('Error creating personal note:', err);
    return res.status(500).json({ error: 'Server error creating personal note.' });
  }
});

// Update a personal note
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subject, topic, content } = req.body;

    const note = await PersonalNote.findOne({
      where: { id, userId: req.user.id }
    });

    if (!note) {
      return res.status(404).json({ error: 'Personal note not found.' });
    }

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({ error: 'Title cannot be empty.' });
      }
      note.title = title.trim();
    }
    if (subject !== undefined) note.subject = subject ? subject.trim() : null;
    if (topic !== undefined) note.topic = topic ? topic.trim() : null;
    if (content !== undefined) note.content = content;

    await note.save();

    return res.json({
      message: 'Note Saved Successfully',
      note
    });
  } catch (err) {
    console.error('Error updating personal note:', err);
    return res.status(500).json({ error: 'Server error updating personal note.' });
  }
});

// Delete a personal note
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const note = await PersonalNote.findOne({
      where: { id, userId: req.user.id }
    });

    if (!note) {
      return res.status(404).json({ error: 'Personal note not found.' });
    }

    await note.destroy();

    return res.json({
      message: 'Note deleted successfully!'
    });
  } catch (err) {
    console.error('Error deleting personal note:', err);
    return res.status(500).json({ error: 'Server error deleting personal note.' });
  }
});

module.exports = router;
