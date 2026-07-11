const express = require('express');
const { SharedNote, User, Bookmark } = require('../models');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all shared notes
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notes = await SharedNote.findAll({
      order: [['createdAt', 'DESC']]
    });

    // Fetch user's bookmarks to calculate isBookmarked dynamically
    const userBookmarks = await Bookmark.findAll({
      where: { userId: req.user.id },
      attributes: ['noteId']
    });
    const bookmarkedSet = new Set(userBookmarks.map(b => b.noteId));

    const notesWithBookmark = notes.map(note => {
      const plain = note.get({ plain: true });
      plain.isBookmarked = bookmarkedSet.has(plain.id);
      return plain;
    });

    return res.json({ notes: notesWithBookmark });
  } catch (err) {
    console.error('Error fetching shared notes:', err);
    return res.status(500).json({ error: 'Server error retrieving shared notes.' });
  }
});

// Toggle bookmark for a shared note
router.post('/:noteId/bookmark', authMiddleware, async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.user.id;

    const note = await SharedNote.findByPk(noteId);
    if (!note) {
      return res.status(404).json({ error: 'Shared note not found.' });
    }

    const existing = await Bookmark.findOne({
      where: { userId, noteId }
    });

    if (existing) {
      await existing.destroy();
      return res.json({ bookmarked: false, message: 'Bookmark removed.' });
    } else {
      await Bookmark.create({ userId, noteId });
      return res.json({ bookmarked: true, message: 'Bookmark added.' });
    }
  } catch (err) {
    console.error('Error toggling bookmark:', err);
    return res.status(500).json({ error: 'Server error toggling bookmark.' });
  }
});

// Create/Publish a platform-wide shared note
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, size, type, content } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name / Title is required.' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Publisher user profile not found.' });
    }

    const calculatedSize = size || `${Math.max(1, Math.round((content || '').length / 500))} KB`;
    const noteType = type || 'lecture';
    const roleName = req.user.role === 'admin' ? 'Admin' : req.user.role === 'mentor' ? 'Mentor' : 'Student';
    const publishedBy = `${user.fullName} (${roleName})`;

    const note = await SharedNote.create({
      name: name.trim(),
      size: calculatedSize,
      type: noteType,
      publishedBy,
      content: content || ''
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

// Update a shared note
router.put('/:noteId', authMiddleware, async (req, res) => {
  try {
    const { noteId } = req.params;
    const { name, size, type } = req.body;

    if (req.user.role !== 'admin' && req.user.role !== 'mentor') {
      return res.status(403).json({ error: 'Access denied. Only Admins and Mentors can edit shared notes.' });
    }

    const note = await SharedNote.findByPk(noteId);
    if (!note) {
      return res.status(404).json({ error: 'Shared note not found.' });
    }

    if (name !== undefined) note.name = name.trim();
    if (size !== undefined) note.size = size.trim();
    if (type !== undefined) note.type = type;

    await note.save();

    return res.json({
      message: 'Shared note updated successfully!',
      note
    });
  } catch (err) {
    console.error('Error updating shared note:', err);
    return res.status(500).json({ error: 'Server error updating shared note.' });
  }
});

// Delete a shared note
router.delete('/:noteId', authMiddleware, async (req, res) => {
  try {
    const { noteId } = req.params;
    if (req.user.role !== 'admin' && req.user.role !== 'mentor') {
      return res.status(403).json({ error: 'Access denied.' });
    }
    const note = await SharedNote.findByPk(noteId);
    if (!note) {
      return res.status(404).json({ error: 'Shared note not found.' });
    }
    await note.destroy();
    return res.json({ message: 'Shared note deleted successfully.' });
  } catch (err) {
    console.error('Error deleting shared note:', err);
    return res.status(500).json({ error: 'Server error deleting shared note.' });
  }
});

module.exports = router;
