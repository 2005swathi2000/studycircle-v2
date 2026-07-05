const express = require('express');
const { Assignment, User } = require('../models');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all assignments (Mentor/Admin/Student)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const assignments = await Assignment.findAll({
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        as: 'Creator',
        attributes: ['fullName', 'username']
      }]
    });
    return res.json({ assignments });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error retrieving assignments.' });
  }
});

// Create assignment (Mentor/Admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'mentor' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Mentors or Administrators privileges required.' });
    }
    const { title, subject, deadline, totalAssigned, details } = req.body;
    if (!title || !deadline) {
      return res.status(400).json({ error: 'Title and Deadline are required.' });
    }

    const assignment = await Assignment.create({
      title,
      subject: subject || 'Data Structures',
      deadline,
      submissionsCount: 0,
      totalAssigned: totalAssigned || 0,
      status: 'Active',
      details: details || '',
      createdBy: req.user.id
    });

    const fullAssignment = await Assignment.findByPk(assignment.id, {
      include: [{
        model: User,
        as: 'Creator',
        attributes: ['fullName', 'username']
      }]
    });

    return res.status(201).json({ message: 'Assignment created successfully!', assignment: fullAssignment });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error creating assignment.' });
  }
});

// Update assignment (Mentor/Admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'mentor' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Mentors or Administrators privileges required.' });
    }
    const { title, subject, deadline, totalAssigned, status, details } = req.body;
    const { id } = req.params;

    const assignment = await Assignment.findByPk(id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }

    assignment.title = title !== undefined ? title : assignment.title;
    assignment.subject = subject !== undefined ? subject : assignment.subject;
    assignment.deadline = deadline !== undefined ? deadline : assignment.deadline;
    assignment.totalAssigned = totalAssigned !== undefined ? Number(totalAssigned) : assignment.totalAssigned;
    assignment.status = status !== undefined ? status : assignment.status;
    assignment.details = details !== undefined ? details : assignment.details;

    await assignment.save();

    const fullAssignment = await Assignment.findByPk(assignment.id, {
      include: [{
        model: User,
        as: 'Creator',
        attributes: ['fullName', 'username']
      }]
    });

    return res.json({ message: 'Assignment updated successfully!', assignment: fullAssignment });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error updating assignment.' });
  }
});

// Delete assignment (Mentor/Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'mentor' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Mentors or Administrators privileges required.' });
    }
    const { id } = req.params;

    const assignment = await Assignment.findByPk(id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }

    await assignment.destroy();
    return res.json({ message: 'Assignment deleted successfully!' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error deleting assignment.' });
  }
});

module.exports = router;
