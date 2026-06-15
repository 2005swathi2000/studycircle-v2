require('dotenv').config();
const crypto = require('crypto');

if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'super_secret_study_circle_token_2026_key_ap_telangana') {
    console.warn('[SECURITY WARNING] JWT_SECRET is missing or insecure in production mode. Generating a secure, temporary secret dynamically...');
    process.env.JWT_SECRET = crypto.randomBytes(64).toString('hex');
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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};

const app = express();
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

// Socket.IO binding
require('./sockets/presence')(io);

// Root
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the StudyCircle API Server v2!' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.sync();
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
