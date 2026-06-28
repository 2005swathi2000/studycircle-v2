require('dotenv').config();
const crypto = require('crypto');

if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET) {
    console.warn('[SECURITY WARNING] JWT_SECRET is missing in production mode. Generating a secure, temporary secret dynamically...');
    process.env.JWT_SECRET = crypto.randomBytes(64).toString('hex');
  } else if (process.env.JWT_SECRET === 'super_secret_study_circle_token_2026_key_ap_telangana') {
    console.warn('[SECURITY WARNING] JWT_SECRET is using the insecure default key in production mode. Please define a custom JWT_SECRET in your Render/production environment variables to ensure secure and persistent user sessions.');
  }
}

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
const { sequelize } = require('./models');

// Route Imports
const authRoutes = require('./routes/auth');
const groupRoutes = require('./routes/groups');
const noteRoutes = require('./routes/notes');
const sessionRoutes = require('./routes/sessions');
const progressRoutes = require('./routes/progress');
const doubtRoutes = require('./routes/doubts');
const sharedNoteRoutes = require('./routes/sharedNotes');
const notificationRoutes = require('./routes/notifications');

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:3000', 'https://studycircle-collaborative-learning.vercel.app'];

console.log('Allowed CORS Origins:', allowedOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.includes(origin) || 
                      origin.endsWith('.vercel.app') || 
                      /^http:\/\/localhost(:\d+)?$/.test(origin);
                      
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`Origin blocked by CORS: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  exposedHeaders: ['x-new-access-token', 'x-new-refresh-token']
};

const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app);
const io = new Server(server, {
  cors: corsOptions
});

// Expose io instance to Express app routes
app.set('io', io);

// Middleware
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/doubts', doubtRoutes);
app.use('/api/shared-notes', sharedNoteRoutes);
app.use('/api/notifications', notificationRoutes);

// AI Tutor API Route calling Gemini API
app.post('/api/ai-tutor', async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text prompt is required.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const systemPrompt = `You are the StudyCircle AI Academic Tutor, a helpful and knowledgeable learning assistant. 
Explain complex academic topics in a clear, friendly, and structured tutoring style. 
If the user asks questions in another language (such as Telugu, Tenglish, Hindi, Spanish, etc.), reply naturally in that same language or code-mixed format (e.g. Tenglish).
Always output formatted Markdown using clear sections, lists, tables, or bold text.
If the question is about StudyCircle XP, coins, shop, or study rooms, explain that:
- Desking/timer study hours in Voice Desks earns XP (+10 XP) and Focus Coins (+5 Coins) every 10 minutes.
- Doubts resolved in the Community Hub awards +20 XP.
- Coins are spent in the Vault Shop to unlock profile badges and dark mode themes.

User Query: ${text}`;

  if (apiKey) {
    try {
      console.log('[AI Tutor] Querying Google Gemini API...');
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }]
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (responseText) {
          return res.json({ response: responseText });
        }
      }
      console.warn('[AI Tutor Warning] Gemini API failed or returned empty. Trying Pollinations AI fallback...');
    } catch (error) {
      console.error('[AI Tutor Error] Gemini API error:', error);
      console.log('Trying Pollinations AI fallback...');
    }
  } else {
    console.log('[AI Tutor] GEMINI_API_KEY is not defined. Using Pollinations AI.');
  }

  // Pollinations AI Fallback (100% Free, Keyless, Dynamic AI)
  try {
    const response = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are the StudyCircle AI Academic Tutor, a helpful and knowledgeable learning assistant. Explain complex academic topics in a clear, friendly, and structured tutoring style. If the user asks questions in another language (such as Telugu, Tenglish, Hindi, Spanish, etc.), reply naturally in that same language or code-mixed format (e.g. Tenglish). Always output formatted Markdown using clear sections, lists, tables, or bold text. If the question is about StudyCircle XP, coins, shop, or study rooms, explain that: desking/timer study hours in Voice Desks earns XP (+10 XP) and Focus Coins (+5 Coins) every 10 minutes; doubts resolved in the Community Hub awards +20 XP; coins are spent in the Vault Shop to unlock profile badges and dark mode themes.' },
          { role: 'user', content: text }
        ]
      })
    });

    if (response.ok) {
      let responseText = await response.text();
      if (responseText && responseText.trim()) {
        // Strip Pollinations.AI support section/ad footer if present
        const footerIndex = responseText.indexOf('**Support Pollinations.AI:**');
        if (footerIndex !== -1) {
          responseText = responseText.substring(0, footerIndex).trim();
        }
        const adIndex = responseText.indexOf('🌸 **Ad** 🌸');
        if (adIndex !== -1) {
          responseText = responseText.substring(0, adIndex).trim();
        }
        const supportIndex = responseText.indexOf('Support Pollinations.AI');
        if (supportIndex !== -1) {
          responseText = responseText.substring(0, supportIndex).trim();
        }
        // Remove trailing markdown horizontal rules and spaces
        responseText = responseText.replace(/[\s\-\*\_]*$/g, '').trim();

        return res.json({ response: responseText });
      }
    }
    throw new Error(`Pollinations API returned status ${response.status}`);
  } catch (error) {
    console.error('[AI Tutor Error] Pollinations AI error:', error);
    
    // Final Static Fallback in case of absolute network failure
    const lowerText = text.toLowerCase();
    let responseText = "";
    if (lowerText.includes('dbms') || lowerText.includes('normal')) {
      responseText = `### Database Normalization Explained 📊\n\nNormalization is the process of organizing data in a database to reduce redundancy and improve data integrity. Here are the first three Normal Forms (NF):\n\n1. **First Normal Form (1NF)**:\n   * Values in each column must be **atomic** (indivisible).\n   * No repeating groups of columns.\n   * *Example*: If a field contains multiple phone numbers, split them into separate rows.\n\n2. **Second Normal Form (2NF)**:\n   * Must be in **1NF**.\n   * All non-key attributes must be **fully functionally dependent** on the primary key (no partial dependency).\n   * *Example*: In a composite primary key \`(StudentID, SubjectID)\`, a column \`SubjectTeacherName\` depends only on \`SubjectID\`. This violates 2NF and must be moved to a separate \`Subjects\` table.\n\n3. **Third Normal Form (3NF)**:\n   * Must be in **2NF**.\n   * There must be no **transitive functional dependency** (non-key columns depending on other non-key columns).\n   * *Example*: If a table has \`StudentID\`, \`ZipCode\`, and \`City\`, where \`City\` depends on \`ZipCode\` and \`ZipCode\` depends on \`StudentID\`. Move \`ZipCode\` and \`City\` to a separate address table to satisfy 3NF.`;
    } else if (lowerText.includes('process') || lowerText.includes('thread')) {
      responseText = `### Processes vs. Threads in Operating Systems 🧠\n\nAn operating system uses both **processes** and **threads** to run code, but they have major differences:\n\n| Feature | Process | Thread |\n| :--- | :--- | :--- |\n| **Definition** | An independent program in execution. | A lightweight segment of a process. |\n| **Address Space** | Has its own separate address space. | Shares the parent process's address space. |\n| **Overhead** | High creation and switching overhead. | Low creation and switching overhead. |\n| **Communication** | Uses Inter-Process Communication (IPC). | Can communicate directly via shared memory. |\n| **Fault Tolerance** | If one process crashes, others are unaffected. | If one thread crashes, the entire process crashes. |\n\n*Quick Tip*: Think of a process as a **house** and threads as the **rooms** inside. The rooms share the plumbing (memory) of the house!`;
    } else if (lowerText.includes('coin') || lowerText.includes('xp') || lowerText.includes('reward') || lowerText.includes('points') || lowerText.includes('shop') || lowerText.includes('unlock')) {
      responseText = `### 🪙 StudyCircle Rewards & Gamification Guide\n\nYou can earn experience points (**XP**) and **Focus Coins** by being active on the platform. Here is how:\n\n1. **Voice Study Desks**: Join a Voice Desk (Lounge or Circle rooms) to start your timer. For every 10 minutes of active desking, you earn **+10 XP** and **+5 Focus Coins**.\n2. **Community Hub Doubts**: Ask a question or answer doubts. Marking an answer as the **Accepted Solution** awards the solver **+20 XP**.\n3. **Daily Missions**: Check the checklist on your dashboard. Completing daily goals awards bonus coins and XP.\n4. **Custom Shop**: Spend your **Focus Coins** in the **Vault Shop** to purchase profile badges, custom interface skins, and dynamic status headers!`;
    } else if (lowerText.includes('distract') || lowerText.includes('pomodoro') || lowerText.includes('focus') || lowerText.includes('study') || lowerText.includes('tip') || lowerText.includes('plan')) {
      responseText = `### ⚡ 5 Tips to Maintain Ultimate Focus\n\nAs your AI Tutor, here are my top recommendations to stay in high-focus learning zones:\n\n1. **Use the Pomodoro Technique**: Study for 25 minutes, then take a 5-minute break. After 4 cycles, take a longer 15-minute break. Use the Learning Space stopwatch timer on your dashboard to log this!\n2. **Eliminate Micro-Distractions**: Put your phone in another room and close unrelated browser tabs. \n3. **Join Active Voice Desks**: StudyCircle's voice rooms provide social accountability. Studying alongside other cluster students helps keep you on track.\n4. **Set Daily Micro-Goals**: Rather than "study for exams", write "Solve 3 DBMS normalization queries". Use your dashboard tasks list to track them.\n5. **Reward Yourself**: Complete your daily missions, claim your Focus Coins, and check out the customization skins in the Shop!`;
    } else {
      responseText = `Hello! I am your AI Study Tutor. I can answer any question about DBMS, Operating Systems, Computer Networks, or platform features. Please let me know what you would like to learn today!`;
    }
    res.json({ response: responseText });
  }
});

// Socket.IO binding
require('./sockets/presence')(io);

// Root
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the StudyCircle API Server v2!' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const isSqlite = sequelize.options.dialect === 'sqlite';
    if (isSqlite) {
      await sequelize.query('PRAGMA foreign_keys = OFF;');
    }
    // Fail-safe column migration check
    try {
      await sequelize.query('ALTER TABLE Users ADD COLUMN lastStudyDate VARCHAR(255) DEFAULT "";');
    } catch (e1) {
      try {
        await sequelize.query('ALTER TABLE "Users" ADD COLUMN "lastStudyDate" VARCHAR(255) DEFAULT \'\';');
      } catch (e2) {
        // Column already exists or table does not exist yet (sync will create it)
      }
    }
    if (isProduction || isSqlite) {
      await sequelize.sync();
    } else {
      await sequelize.sync({ alter: true });
    }
    if (isSqlite) {
      await sequelize.query('PRAGMA foreign_keys = ON;');
    }
    console.log('Database synced successfully.');

    // Seed if empty
    const { seedDatabase } = require('./utils/seeder');
    await seedDatabase();

    // Seed Bloom Filter with initialized usernames
    if (typeof authRoutes.seedBloomFilter === 'function') {
      await authRoutes.seedBloomFilter();
    }

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();
