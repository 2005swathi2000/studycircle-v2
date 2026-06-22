const express = require('express');
const { Note, User, GroupMember } = require('../models');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get notes in a group
router.get('/group/:groupId', authMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params;

    const isMember = await GroupMember.findOne({
      where: { userId: req.user.id, groupId }
    });
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied. You must be a member of this study circle.' });
    }

    const notes = await Note.findAll({
      where: { groupId },
      order: [['isPinned', 'DESC'], ['updatedAt', 'DESC']],
      include: [{
        model: User,
        as: 'Creator',
        attributes: ['fullName', 'username']
      }]
    });

    return res.json({ notes });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error retrieving group notes.' });
  }
});

// Create note
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { groupId, title, content, isPinned } = req.body;
    if (!groupId || !title) {
      return res.status(400).json({ error: 'Group ID and Title are required.' });
    }

    const isMember = await GroupMember.findOne({
      where: { userId: req.user.id, groupId }
    });
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied. You must be a member of this study circle.' });
    }

    const note = await Note.create({
      groupId,
      title,
      content,
      isPinned: isPinned || false,
      createdBy: req.user.id,
      lastEditedBy: req.user.id
    });

    // Update active circle challenges of type notes_uploaded
    try {
      const { Challenge } = require('../models');
      const activeChallenges = await Challenge.findAll({
        where: { groupId, targetType: 'notes_uploaded', status: 'active' }
      });
      for (const challenge of activeChallenges) {
        challenge.currentProgress = (challenge.currentProgress || 0) + 1;
        await challenge.save();
      }
    } catch (challengeErr) {
      console.error('Failed to update challenges on note creation:', challengeErr);
    }

    return res.status(201).json({ message: 'Note created successfully!', note });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error creating note.' });
  }
});

// Update note
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, isPinned } = req.body;

    const note = await Note.findByPk(id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found.' });
    }

    const isMember = await GroupMember.findOne({
      where: { userId: req.user.id, groupId: note.groupId }
    });
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied. You must be a member of this study circle.' });
    }

    note.title = title !== undefined ? title : note.title;
    note.content = content !== undefined ? content : note.content;
    note.isPinned = isPinned !== undefined ? isPinned : note.isPinned;
    note.lastEditedBy = req.user.id;

    await note.save();

    return res.json({ message: 'Note updated successfully!', note });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error updating note.' });
  }
});

// Delete note (with role validation security check)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const note = await Note.findByPk(id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found.' });
    }

    const isMember = await GroupMember.findOne({
      where: { userId: req.user.id, groupId: note.groupId }
    });
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied. You must be a member of this study circle.' });
    }

    // Security check: only note creator, group admins, group mentors, or system admins can delete notes
    if (note.createdBy !== req.user.id && isMember.role !== 'admin' && isMember.role !== 'mentor' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Permission denied. Only the note creator, group coordinators, or admins can delete this note.' });
    }

    await note.destroy();

    return res.json({ message: 'Note deleted successfully!' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error deleting note.' });
  }
});

// AI Summarize Note
router.post('/:id/summarize', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const note = await Note.findByPk(id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found.' });
    }

    const isMember = await GroupMember.findOne({
      where: { userId: req.user.id, groupId: note.groupId }
    });
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied. You must be a member of this study circle.' });
    }

    const content = note.content || '';
    
    // Simple rule-based mock AI summaries based on text content
    let summaryText = "";
    let keyTerms = [];
    let practiceQuestions = [];

    const lowerContent = content.toLowerCase();

    if (lowerContent.includes('dbms') || lowerContent.includes('database') || lowerContent.includes('sql') || note.title.toLowerCase().includes('dbms') || note.title.toLowerCase().includes('database')) {
      summaryText = `This study note covers the fundamentals of Database Management Systems (DBMS), focusing on relational database designs, transaction properties (ACID), and SQL structures. It emphasizes the importance of data normalization (1NF, 2NF, 3NF, BCNF) to eliminate redundancy, and explains index mechanisms such as B-Trees and Hash Indexing to speed up queries. Transactions are discussed in detail, highlighting how concurrency control and lock protocols prevent conflicts like dirty reads or lost updates.`;
      
      keyTerms = [
        { term: "ACID Properties", definition: "Atomicity, Consistency, Isolation, and Durability - the key traits that guarantee reliable database transactions." },
        { term: "Normalization", definition: "The process of organizing data in a database to reduce redundancy and improve data integrity." },
        { term: "B-Tree Index", definition: "A self-balancing search tree structure that keeps data sorted and allows logarithmic search, insert, and delete operations." }
      ];

      practiceQuestions = [
        "Explain the difference between 3NF and BCNF normality forms with a clean example.",
        "How does the two-phase locking (2PL) protocol ensure database serializability?",
        "What is a dirty read anomaly, and which transaction isolation level avoids it?"
      ];
    } else if (lowerContent.includes('os') || lowerContent.includes('operating') || lowerContent.includes('process') || lowerContent.includes('concurrency') || note.title.toLowerCase().includes('os') || note.title.toLowerCase().includes('operating')) {
      summaryText = `This study guide covers core Operating System principles, particularly focusing on process management, concurrency control, and memory allocation. It details how the scheduler manages processes using algorithms (like Round Robin or Priority scheduling) and explains how critical sections, semaphores, and mutexes resolve synchronization bugs. It also outlines the four deadlock conditions (Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait) and lists prevention strategies.`;

      keyTerms = [
        { term: "Mutex / Semaphore", definition: "Synchronization primitives used to control access to shared resource regions in concurrent threads." },
        { term: "Deadlock", definition: "A situation where two or more processes are unable to proceed because each is waiting for the other to release resources." },
        { term: "Virtual Memory", definition: "A memory management capability that uses hardware and software to allow a computer to compensate for physical memory shortages." }
      ];

      practiceQuestions = [
        "What are the four necessary conditions for a deadlock to occur, and how does banker's algorithm prevent it?",
        "Explain the difference between a process and a thread, focusing on memory sharing.",
        "How does demand paging work, and what is page thrashing?"
      ];
    } else if (lowerContent.includes('network') || lowerContent.includes('tcp') || lowerContent.includes('ip') || lowerContent.includes('routing') || note.title.toLowerCase().includes('network') || note.title.toLowerCase().includes('routing')) {
      summaryText = `This study material details Computer Networks, covering the OSI 7-layer model, standard protocols, and routing mechanisms. It highlights the TCP/IP suite, explaining the distinction between TCP (connection-oriented, reliable flow control via sliding windows) and UDP (connectionless, low-overhead streaming). Key IP addressing concepts, subnetting, and algorithms like link-state and distance-vector routing are analyzed.`;

      keyTerms = [
        { term: "TCP Sliding Window", definition: "A flow control protocol mechanism used to manage data transmission speed between a sender and receiver." },
        { term: "Subnet Masking", definition: "A 32-bit number that divides an IP address into network and host address components." },
        { term: "OSI Layer Model", definition: "A conceptual framework detailing network operations across seven logical layers (Physical to Application)." }
      ];

      practiceQuestions = [
        "Describe the TCP three-way handshake process and how connection teardown differs.",
        "Compare Distance Vector (RIP) vs Link State (OSPF) routing algorithms.",
        "What is the function of the ARP protocol in IP to MAC mapping?"
      ];
    } else {
      // Generic fallback summary
      summaryText = `This study guide summarizes the note "${note.title}". It organizes the core concepts into a structured review sheet to aid in active recall and retention. The material focuses on the primary definitions, principles, and applications of the topics discussed, establishing a baseline study guide for examination preparations.`;

      keyTerms = [
        { term: "Core Concept", definition: "The primary theoretical pillar or principle discussed in the student's study sheet." },
        { term: "Application Layer", definition: "How the theoretical guidelines are implemented in practical engineering or scientific contexts." }
      ];

      practiceQuestions = [
        "Summarize the main objective of this study note in your own words.",
        "What are the direct applications of the core principles defined here?",
        "Formulate a question of your own that tests the boundary conditions of these concepts."
      ];
    }

    // Simulate AI delay (about 800ms)
    await new Promise(resolve => setTimeout(resolve, 800));

    return res.json({
      summary: summaryText,
      keyTerms,
      practiceQuestions,
      noteTitle: note.title
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error generating AI summary.' });
  }
});

module.exports = router;
