const express = require('express');
const { StudentSchedule } = require('../models');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all study schedules for the logged-in student
router.get('/', authMiddleware, async (req, res) => {
  try {
    const schedules = await StudentSchedule.findAll({
      where: { userId: req.user.id },
      order: [
        ['date', 'ASC'],
        ['startTime', 'ASC']
      ]
    });
    return res.json({ schedules });
  } catch (err) {
    console.error('Error fetching student schedules:', err);
    return res.status(500).json({ error: 'Server error fetching study schedules.' });
  }
});

// Create a study schedule
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, subject, date, startTime, endTime, description } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Session Title is required.' });
    }
    if (!subject || !subject.trim()) {
      return res.status(400).json({ error: 'Subject is required.' });
    }
    if (!date) {
      return res.status(400).json({ error: 'Date is required.' });
    }
    if (!startTime || !endTime) {
      return res.status(400).json({ error: 'Start time and end time are required.' });
    }

    const schedule = await StudentSchedule.create({
      userId: req.user.id,
      title: title.trim(),
      subject: subject.trim(),
      date,
      startTime,
      endTime,
      description: description ? description.trim() : null
    });

    return res.status(201).json({
      message: 'Schedule Saved Successfully',
      schedule
    });
  } catch (err) {
    console.error('Error creating student schedule:', err);
    return res.status(500).json({ error: 'Server error creating study schedule.' });
  }
});

// Update a study schedule
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subject, date, startTime, endTime, description } = req.body;

    const schedule = await StudentSchedule.findOne({
      where: { id, userId: req.user.id }
    });

    if (!schedule) {
      return res.status(404).json({ error: 'Study schedule not found.' });
    }

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({ error: 'Session Title cannot be empty.' });
      }
      schedule.title = title.trim();
    }
    if (subject !== undefined) {
      if (!subject.trim()) {
        return res.status(400).json({ error: 'Subject cannot be empty.' });
      }
      schedule.subject = subject.trim();
    }
    if (date !== undefined) schedule.date = date;
    if (startTime !== undefined) schedule.startTime = startTime;
    if (endTime !== undefined) schedule.endTime = endTime;
    if (description !== undefined) schedule.description = description ? description.trim() : null;

    await schedule.save();

    return res.json({
      message: 'Schedule Saved Successfully',
      schedule
    });
  } catch (err) {
    console.error('Error updating student schedule:', err);
    return res.status(500).json({ error: 'Server error updating study schedule.' });
  }
});

// Delete a study schedule
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await StudentSchedule.findOne({
      where: { id, userId: req.user.id }
    });

    if (!schedule) {
      return res.status(404).json({ error: 'Study schedule not found.' });
    }

    await schedule.destroy();

    return res.json({
      message: 'Schedule deleted successfully!'
    });
  } catch (err) {
    console.error('Error deleting student schedule:', err);
    return res.status(500).json({ error: 'Server error deleting study schedule.' });
  }
});

module.exports = router;
