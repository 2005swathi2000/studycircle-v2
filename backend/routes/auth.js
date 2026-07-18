const express = require('express');
const jwt = require('jsonwebtoken');
const dns = require('dns').promises;
const { User, Otp, Notification } = require('../models');
const { Op } = require('sequelize');
const { authMiddleware } = require('../middleware/auth');
const BloomFilter = require('../utils/bloom');
const { sendMail, sendSMS, hasSmtpConfig } = require('../utils/notifier');
const rateLimit = require('express-rate-limit');

const router = express.Router();
const bloomFilter = new BloomFilter(2048);

const getTodayISTString = () => {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata"
  });
};
router.getTodayISTString = getTodayISTString;

const getYesterdayISTString = () => {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return yesterday.toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata"
  });
};
router.getYesterdayISTString = getYesterdayISTString;

const getXpThresholdForLevel = (level) => {
  let totalXp = 0;
  for (let l = 1; l < level; l++) {
    totalXp += Math.floor(100 * Math.pow(l, 1.3));
  }
  return totalXp;
};
router.getXpThresholdForLevel = getXpThresholdForLevel;

const calculateLevel = (xp) => {
  let level = 1;
  while (true) {
    const nextLevelMin = getXpThresholdForLevel(level + 1);
    if (xp < nextLevelMin) {
      break;
    }
    level++;
  }
  return level;
};
router.calculateLevel = calculateLevel;


const checkDomainMx = async (domain) => {
  try {
    const records = await dns.resolveMx(domain);
    return records && records.length > 0;
  } catch (err) {
    return false;
  }
};

const isGmailTypo = (email) => {
  if (typeof email !== 'string') return false;
  const parts = email.trim().toLowerCase().split('@');
  if (parts.length !== 2) return false;
  const domain = parts[1];
  const gmailTypos = [
    'gmaail.com', 'gmaill.com', 'gamil.com', 'gmal.com', 'gmil.com', 
    'gmaile.com', 'gmai.com', 'gmeil.com', 'gmail.con', 'gamail.com',
    'gmaail.co', 'gmaill.co', 'gamil.co', 'gmal.co', 'gmil.co', 
    'gmaile.co', 'gmai.co', 'gmeil.co', 'gamail.co', 'gmaial.com'
  ];
  return gmailTypos.includes(domain);
};

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP or contact to 100 send-otp requests per windowMs for testing
  message: { error: 'Too many OTP requests from this IP. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 login requests per windowMs
  message: { error: 'Too many login attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
const emailInbox = [];

// Seed Bloom Filter function called from server after database sync
const seedBloomFilter = async () => {
  try {
    const users = await User.findAll({ attributes: ['username'] });
    users.forEach(u => {
      if (u.username) bloomFilter.add(u.username.toLowerCase());
    });
    console.log(`[BloomFilter] Seeded with ${users.length} usernames.`);
  } catch (err) {
    console.error('Error seeding Bloom Filter:', err);
  }
};
router.seedBloomFilter = seedBloomFilter;

const signToken = (user, rememberMe = false) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET || 'super_secret_study_circle_token_2026_key_ap_telangana',
    { expiresIn: rememberMe ? '30d' : '7d' }
  );
};

// Route: Validate Username using Bloom Filter + database fallback
router.get('/validate-username', async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ error: 'Username is required.' });
    }
    const normalized = username.trim().toLowerCase();

    // 1. Check Bloom Filter
    const inBloom = bloomFilter.test(normalized);
    if (!inBloom) {
      return res.json({ available: true, checkMethod: 'Bloom Filter (Definitely Available)' });
    }

    // 2. Fallback check on DB if Bloom Filter reports a potential duplicate
    const existing = await User.findOne({ where: { username: normalized } });
    if (existing) {
      return res.json({ available: false, checkMethod: 'Database Query (Already Taken)' });
    }

    return res.json({ available: true, checkMethod: 'Database Query (False Positive Resolved)' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error validating username.' });
  }
});

const isRealContact = (val) => {
  const trimmed = val.trim().toLowerCase();
  
  // Check for mock domains or explicit mock emails
  if (
    trimmed.endsWith('@test.com') ||
    trimmed.endsWith('@example.com') ||
    trimmed.endsWith('@mock.com') ||
    trimmed.endsWith('@studycircle.com') ||
    trimmed.endsWith('.test') ||
    trimmed.endsWith('.example')
  ) {
    return false;
  }
  
  // Check for mock phone numbers
  if (
    trimmed === '1234567890' ||
    trimmed === '9876543210' ||
    trimmed.startsWith('555') ||
    trimmed.length < 10
  ) {
    return false;
  }
  
  return true;
};

// Route: Send OTP (Mock SMS/Email gateway)
router.post('/send-otp', otpLimiter, async (req, res) => {
  try {
    const { type, value, username, isReset, phoneOrEmail } = req.body;
    let targetValue = value || phoneOrEmail;

    if (isReset) {
      const searchContact = (targetValue || '').trim().toLowerCase();
      const searchUsername = (username || '').trim().toLowerCase();

      let user = null;
      if (searchContact) {
        user = await User.findOne({ where: { phoneOrEmail: searchContact } });
      }
      if (!user && searchUsername) {
        user = await User.findOne({ where: { username: searchUsername } });
      }

      if (!user) {
        return res.status(404).json({ error: 'Account with this email or phone number not found.' });
      }
      if (!user.phoneOrEmail) {
        return res.status(400).json({ error: 'No verification email or phone registered for this account.' });
      }
      targetValue = user.phoneOrEmail;
    }

    if (!targetValue) {
      return res.status(400).json({ error: 'Email or phone number is required.' });
    }

    const trimmedValue = targetValue.trim().toLowerCase();

    // Validate format
    const isEmail = trimmedValue.includes('@');
    if (isEmail) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
        return res.status(400).json({ error: 'Invalid email, please check and try again!' });
      }
      if (isGmailTypo(trimmedValue)) {
        return res.status(400).json({ error: 'Invalid email spelling. Check proper and try again' });
      }
      // Perform MX record lookup on real email domains to verify domain exists
      const isReal = isRealContact(trimmedValue);
      if (isReal) {
        const domain = trimmedValue.split('@')[1];
        const hasMx = await checkDomainMx(domain);
        if (!hasMx) {
          return res.status(400).json({ error: 'Invalid email, please check and try again!' });
        }
      }
    } else {
      if (!/^\+?[0-9]{10,14}$/.test(trimmedValue)) {
        return res.status(400).json({ error: 'Invalid email, please check and try again!' });
      }
    }
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 min expiry

    await Otp.destroy({ where: { phoneOrEmail: trimmedValue } });
    await Otp.create({
      phoneOrEmail: trimmedValue,
      otp,
      expiresAt: new Date(expiresAt)
    });
    console.log(`[OTP DEBUG] Sent ${type || 'Verification'} OTP: ${otp} to: ${trimmedValue}`);

    // Check target type (Email or Phone)
    let isRealSent = false;
    let deliveryMethod = 'mock';

    const isMockOtp = process.env.MOCK_OTP !== 'false';
    const isReal = isRealContact(trimmedValue);

    // Send in real if MOCK_OTP is false OR if the contact is a real email/phone
    if (!isMockOtp || isReal) {
      if (isEmail) {
        const subject = isReset ? 'StudyCircle: Password Reset Request' : 'StudyCircle: Verify Your Account';
        const body = `Hi there,\n\nYour StudyCircle verification code is: ${otp}.\n\nThis code is valid for 5 minutes. If you did not request this, please ignore this email.\n\nWarm regards,\nStudyCircle Team`;
        const mailResult = await sendMail(trimmedValue, subject, body);
        isRealSent = mailResult.success;
        deliveryMethod = mailResult.method || 'mock';

      } else {
        const body = `Your StudyCircle verification code is: ${otp}. Valid for 5 minutes.`;
        isRealSent = await sendSMS(trimmedValue, body);
        deliveryMethod = isRealSent ? 'sms' : 'mock';
      }

      // If a real contact was specified, but we failed to send the real OTP, return error immediately
      if (isReal && !isRealSent) {
        return res.status(400).json({ error: 'Failed to send verification email. Please check your email address or try again later.' });
      }
    }

    // Record to mock email inbox ONLY for mock contacts when mock mode is enabled
    const showMockFlow = isMockOtp && !isReal;
    if (showMockFlow) {
      emailInbox.unshift({
        id: Date.now().toString(),
        to: trimmedValue,
        subject: isReset ? 'StudyCircle: Password Reset Request' : 'StudyCircle: Verify Your Account',
        body: `Hi there,\n\nYour StudyCircle verification code is: ${otp}.\n\nThis code is valid for 5 minutes. If you did not request this, please ignore this email.\n\nWarm regards,\nStudyCircle Team`,
        otp,
        createdAt: new Date().toLocaleTimeString()
      });
    }

    let successMessage = `OTP sent successfully to ${trimmedValue}!`;
    if (isRealSent) {
      if (isEmail) {
        if (deliveryMethod === 'fallback') {
          successMessage = `OTP sent to ${trimmedValue} via fallback! First time using this email? Please check your inbox (and spam) to 'Activate' FormSubmit.co to allow forwarding.`;
        } else if (deliveryMethod === 'brevo') {
          successMessage = `OTP sent successfully to ${trimmedValue} via Brevo HTTP API!`;
        } else {
          successMessage = `OTP sent successfully to ${trimmedValue} via SMTP!`;
        }
      } else {
        successMessage = `OTP sent successfully to ${trimmedValue} via SMS!`;
      }
    } else {
      successMessage = `OTP registered successfully (mocked). Developer mode active: please copy the OTP from the floating Mock Inbox or sliding banner.`;
    }

    return res.json({
      message: successMessage,
      debugOtp: showMockFlow ? otp : undefined, // Do not expose OTP in response for real contacts
      email: trimmedValue,
      deliveryMethod,
      isMocked: showMockFlow // Only trigger screen banner and autofill for mock contacts
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error sending OTP.' });
  }
});

// Route: Get Mock Email Inbox
router.get('/mock-inbox', (req, res) => {
  return res.json({ inbox: emailInbox });
});

// Route: Clear Mock Email Inbox
router.post('/clear-mock-inbox', (req, res) => {
  emailInbox.length = 0;
  return res.json({ success: true, message: 'Mock inbox cleared.' });
});

// Register Route
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, username, password, role, email, phone, gender, otp } = req.body;

    if (!firstName || !lastName || !username || !password || !gender) {
      return res.status(400).json({ error: 'First name, last name, username, password, and gender are required.' });
    }

    if (phone) {
      const trimmedPhone = phone.trim();
      if (!/^[0-9]{10}$/.test(trimmedPhone)) {
        return res.status(400).json({ error: 'Phone number must contain exactly 10 digits.' });
      }
    }

    const normalizedUsername = username.trim().toLowerCase();
    const validRole = (role === 'admin' || role === 'mentor' || role === 'student') ? role : 'student';
    const normalizedGender = (gender === 'male' || gender === 'female' || gender === 'other') ? gender : 'other';

    // Calculate composite fields for backward compatibility
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const phoneOrEmail = (email || phone || '').trim().toLowerCase();

    if (email && isGmailTypo(email)) {
      return res.status(400).json({ error: 'Invalid email spelling. Check proper and try again' });
    }
    if (phoneOrEmail.includes('@') && isGmailTypo(phoneOrEmail)) {
      return res.status(400).json({ error: 'Invalid email spelling. Check proper and try again' });
    }

    // Verification check for all accounts
    if (!phoneOrEmail || !otp) {
      return res.status(400).json({ error: 'Email or phone number and OTP are required for registration.' });
    }
    
    const normalizedContact = phoneOrEmail.trim().toLowerCase();
    const otpRecord = await Otp.findOne({ where: { phoneOrEmail: normalizedContact } });
    if (!otpRecord || otpRecord.otp !== otp || Date.now() > new Date(otpRecord.expiresAt).getTime()) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }
    
    // Burn OTP on use
    await Otp.destroy({ where: { phoneOrEmail: normalizedContact } });

    // Check if username already exists
    const existingUser = await User.findOne({ where: { username: normalizedUsername } });
    if (existingUser) {
      return res.status(400).json({ error: 'Username is already taken.' });
    }

    // Set avatarUrl based on gender
    let avatarUrl = '/charan-avatar.png'; // default male
    if (normalizedGender === 'female') {
      avatarUrl = '/swathi-avatar.png';
    } else if (normalizedGender === 'other') {
      avatarUrl = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236B7280"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
    }

    let isApproved = true;

    const defaultMissions = [
      { id: 'join_circle', text: 'Join Study Circle', completed: false, xp: 30 },
      { id: 'attend_session', text: 'Attend Session', completed: false, xp: 30 },
      { id: 'upload_notes', text: 'Upload Notes', completed: false, xp: 40 },
      { id: 'complete_session', text: 'Complete Session', completed: false, xp: 50 }
    ];

    // Create user
    const newUser = await User.create({
      fullName,
      username: normalizedUsername,
      password,
      role: validRole,
      phoneOrEmail,
      isVerified: true,
      isApproved,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email ? email.trim().toLowerCase() : null,
      phone: phone ? phone.trim() : null,
      gender: normalizedGender,
      avatarUrl,
      dailyMissions: defaultMissions,
      dailyMissionDate: getTodayISTString()
    });

    // Add new username to Bloom Filter
    bloomFilter.add(normalizedUsername);

    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: newUser.role },
      process.env.JWT_SECRET || 'super_secret_study_circle_token_2026_key_ap_telangana',
      { expiresIn: '7d' }
    );
    const refreshToken = jwt.sign(
      { id: newUser.id, type: 'refresh', rememberMe: false },
      process.env.JWT_REFRESH_SECRET || 'refresh_secret_study_circle_2026',
      { expiresIn: '30d' }
    );

    // Set HttpOnly cookies
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    return res.status(201).json({
      message: 'Registration successful!',
      token,
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        username: newUser.username,
        role: newUser.role,
        isApproved: newUser.isApproved,
        avatarUrl: newUser.avatarUrl,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone,
        gender: newUser.gender,
        learningGoal: newUser.learningGoal,
        learningLevel: newUser.learningLevel,
        dailyTarget: newUser.dailyTarget,
        dailyMissions: newUser.dailyMissions,
        dailyMissionDate: newUser.dailyMissionDate
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error during registration.' });
  }
});

const checkAndResetDailyMissions = async (user) => {
  const todayStr = getTodayISTString();
  const yesterdayStr = getYesterdayISTString();

  if (user.role === 'student') {
    const lastStudy = user.lastStudyDate || '';
    if (lastStudy !== todayStr && lastStudy !== yesterdayStr) {
      user.streakCount = 0;
    }
  }

  if (user.role === 'student' && user.dailyMissionDate !== todayStr) {
    user.dailyMissions = [
      { id: 'join_circle', text: 'Join Study Circle', completed: false, xp: 30 },
      { id: 'attend_session', text: 'Attend Session', completed: false, xp: 30 },
      { id: 'upload_notes', text: 'Upload Notes', completed: false, xp: 40 },
      { id: 'complete_session', text: 'Complete Session', completed: false, xp: 50 }
    ];
    user.dailyMissionDate = todayStr;
    user.dailyXpEarned = 5; // Reset to 5 because they just earned 5 XP for daily login
    
    // Daily Login Reward: +5 Focus Coins, +5 XP
    user.focusCoins = (user.focusCoins || 0) + 5;
    user.xp = (user.xp || 0) + 5;
    user.level = calculateLevel(user.xp);
    
    await user.save();
  } else if (user.changed('streakCount')) {
    await user.save();
  }
};

// Login Route
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password, portal, rememberMe } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const normalizedUsername = username.trim().toLowerCase();

    const user = await User.findOne({
      where: {
        [Op.or]: [
          { username: normalizedUsername },
          { email: normalizedUsername },
          { phone: normalizedUsername },
          { phoneOrEmail: normalizedUsername }
        ]
      }
    });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email/username or password.' });
    }

    if (user.provider === 'google') {
      return res.status(400).json({ error: 'This account was created using Google. Please continue with Google Sign-In.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid username or password.' });
    }

    // Reset daily missions if a new day has arrived
    await checkAndResetDailyMissions(user);

    // Enforce Portal Restrictions / Role Separation
    if (portal === 'student') {
      if (user.role !== 'student') {
        return res.status(403).json({ error: 'This portal is only for students. Mentors and Admins must login via the right portal.' });
      }
    } else if (portal === 'mentor') {
      if (user.role !== 'mentor') {
        return res.status(403).json({ error: 'This option is only for mentors. Admins and Students must choose their correct option.' });
      }
    } else if (portal === 'admin') {
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'This option is only for administrators. Mentors and Students must choose their correct option.' });
      }
    }

    // Block non-approved accounts
    if (!user.isApproved) {
      return res.status(403).json({ error: 'Your account is pending administrator approval. Please contact an existing admin.' });
    }

    const remember = !!rememberMe;
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'super_secret_study_circle_token_2026_key_ap_telangana',
      { expiresIn: remember ? '30d' : '7d' }
    );
    const refreshToken = jwt.sign(
      { id: user.id, type: 'refresh', rememberMe: remember },
      process.env.JWT_REFRESH_SECRET || 'refresh_secret_study_circle_2026',
      { expiresIn: remember ? '30d' : '7d' }
    );

    // Set HttpOnly cookies
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      maxAge: remember ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      maxAge: remember ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000
    });

    return res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        role: user.role,
        isApproved: user.isApproved,
        streakCount: user.streakCount,
        totalStudyHours: user.totalStudyHours,
        avatarUrl: user.avatarUrl,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        learningGoal: user.learningGoal,
        learningLevel: user.learningLevel,
        dailyTarget: user.dailyTarget,
        dailyMissions: user.dailyMissions,
        dailyMissionDate: user.dailyMissionDate
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error during login.' });
  }
});

// Logout Route
router.post('/logout', (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/'
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/'
  });
  return res.json({ message: 'Logged out successfully!' });
});

// Reset Password Route
router.post('/reset-password', async (req, res) => {
  try {
    const { username, phoneOrEmail, newPassword, otp } = req.body;
    const contactInput = phoneOrEmail || username;

    if (!contactInput || !newPassword || !otp) {
      return res.status(400).json({ error: 'Email/Phone or Username, new password, and OTP verification code are required.' });
    }

    const normalizedContactInput = contactInput.trim().toLowerCase();

    let user = await User.findOne({ where: { phoneOrEmail: normalizedContactInput } });
    if (!user) {
      user = await User.findOne({ where: { username: normalizedContactInput } });
    }

    if (!user) {
      return res.status(404).json({ error: 'Account with this email, phone, or username not found.' });
    }

    if (!user.phoneOrEmail) {
      return res.status(400).json({ error: 'No verification contact registered for this account.' });
    }

    const normalizedContact = user.phoneOrEmail.trim().toLowerCase();
    const otpRecord = await Otp.findOne({ where: { phoneOrEmail: normalizedContact } });
    if (!otpRecord || otpRecord.otp !== otp || Date.now() > new Date(otpRecord.expiresAt).getTime()) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    // Burn OTP
    await Otp.destroy({ where: { phoneOrEmail: normalizedContact } });

    user.password = newPassword;
    await user.save();

    return res.json({ message: 'Password reset successful!' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error during password reset.' });
  }
});

// Get current user profile (Me)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    // Reset daily missions if a new day has arrived
    await checkAndResetDailyMissions(user);
    
    // Resolve current token to pass back to front end context
    let activeToken = req.newAccessToken;
    if (!activeToken) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        activeToken = authHeader.split(' ')[1];
      } else if (req.headers.cookie) {
        const match = req.headers.cookie.match(/(^| )token=([^;]+)/);
        if (match) {
          activeToken = match[2];
        }
      }
    }

    return res.json({ user, token: activeToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error retrieving user profile.' });
  }
});

// Update user profile (PUT /update-profile)
router.put('/update-profile', authMiddleware, async (req, res) => {
  try {
    const { firstName, lastName, fullName, email, phone, avatarUrl, profileImage, bio, learningGoal, learningLevel, dailyTarget, focusCoins, badges, xp, level, college, expertise, availability } = req.body;
    
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (fullName !== undefined) {
      if (!fullName || fullName.trim().length < 3) {
        return res.status(400).json({ error: 'Full Name must be at least 3 characters.' });
      }
      user.fullName = fullName.trim();
      const parts = user.fullName.split(/\s+/);
      user.firstName = parts[0] || '';
      user.lastName = parts.slice(1).join(' ') || '.';
    } else {
      if (firstName !== undefined) {
        if (!firstName || firstName.trim() === '') {
          return res.status(400).json({ error: 'First name cannot be empty.' });
        }
        user.firstName = firstName.trim();
      }

      if (lastName !== undefined) {
        if (!lastName || lastName.trim() === '') {
          return res.status(400).json({ error: 'Last name cannot be empty.' });
        }
        user.lastName = lastName.trim();
      }
      
      const updatedFirstName = user.firstName || '';
      const updatedLastName = user.lastName || '';
      if (updatedFirstName || updatedLastName) {
        user.fullName = `${updatedFirstName} ${updatedLastName}`.trim();
      }
    }

    if (email !== undefined) {
      const trimmedEmail = email ? email.trim().toLowerCase() : '';
      if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        return res.status(400).json({ error: 'Please enter a valid email address.' });
      }
      if (trimmedEmail !== user.email) {
        const existingEmail = await User.findOne({ where: { email: trimmedEmail } });
        if (existingEmail) {
          return res.status(400).json({ error: 'Email already exists.' });
        }
      }
      user.email = trimmedEmail;
    }

    if (phone !== undefined) {
      const trimmedPhone = phone ? phone.trim() : '';
      if (!trimmedPhone || !/^[0-9]{10}$/.test(trimmedPhone)) {
        return res.status(400).json({ error: 'Phone number must contain exactly 10 digits.' });
      }
      user.phone = trimmedPhone;
    }

    if (profileImage !== undefined) {
      user.avatarUrl = profileImage;
    } else if (avatarUrl !== undefined) {
      user.avatarUrl = avatarUrl;
    }

    if (bio !== undefined) {
      if (bio && bio.length > 150) {
        return res.status(400).json({ error: 'Bio cannot exceed 150 characters.' });
      }
      user.bio = bio ? bio.trim() : null;
    }

    if (learningGoal !== undefined) {
      user.learningGoal = learningGoal;
    }

    if (learningLevel !== undefined) {
      user.learningLevel = learningLevel;
    }

    if (dailyTarget !== undefined) {
      user.dailyTarget = Number(dailyTarget);
    }

    if (focusCoins !== undefined) {
      user.focusCoins = Number(focusCoins);
    }

    if (badges !== undefined) {
      user.badges = badges;
    }

    if (xp !== undefined) {
      user.xp = Number(xp);
    }

    if (level !== undefined) {
      user.level = Number(level);
    }

    if (req.body.dailyMissions !== undefined) {
      user.dailyMissions = req.body.dailyMissions;
    }

    if (req.body.dailyMissionDate !== undefined) {
      user.dailyMissionDate = req.body.dailyMissionDate;
    }

    if (college !== undefined) {
      user.college = college ? college.trim() : '';
    }

    if (expertise !== undefined) {
      user.expertise = typeof expertise === 'string' ? expertise : JSON.stringify(expertise);
    }

    if (availability !== undefined) {
      user.availability = availability ? availability.trim() : 'Available';
    }

    user.phoneOrEmail = user.email || user.phone || null;

    await user.save();

    // Exclude password from the returned user details
    const updatedUser = {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      role: user.role,
      phoneOrEmail: user.phoneOrEmail,
      isVerified: user.isVerified,
      isApproved: user.isApproved,
      streakCount: user.streakCount,
      totalStudyHours: user.totalStudyHours,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      learningGoal: user.learningGoal,
      learningLevel: user.learningLevel,
      dailyTarget: user.dailyTarget,
      focusCoins: user.focusCoins,
      badges: user.badges,
      xp: user.xp,
      level: user.level,
      dailyMissions: user.dailyMissions,
      dailyMissionDate: user.dailyMissionDate,
      college: user.college,
      expertise: user.expertise,
      availability: user.availability
    };

    return res.json({
      message: 'Profile updated successfully!',
      user: updatedUser
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error updating user profile.' });
  }
});

// Get all registered students (Mentor/Admin only)
router.get('/students', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'mentor' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Mentor or Administrator privileges required.' });
    }
    const { Op } = require('sequelize');
    const students = await User.findAll({
      where: { role: 'student' },
      attributes: ['id', 'fullName', 'username', 'email', 'phone', 'gender', 'streakCount', 'totalStudyHours', 'xp', 'focusCoins', 'level', 'department', 'badges', 'learningGoal', 'learningLevel', 'lastStudyDate', 'createdAt']
    });
    return res.json({ students });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error retrieving students roster.' });
  }
});

// Assign a challenge to a student (Mentor/Admin only)
router.post('/assign-challenge', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'mentor' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Mentor or Administrator privileges required.' });
    }
    const { studentId, title, description, dueDate, priority, xpReward, coinReward } = req.body;
    if (!studentId || !title || !description) {
      return res.status(400).json({ error: 'Student ID, Task Title, and Description are required.' });
    }

    const student = await User.findByPk(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ error: 'Student user not found.' });
    }

    const tasks = student.assignedTasks || [];
    const newTask = {
      id: 'task-' + Date.now(),
      title,
      description,
      dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: priority || 'Medium',
      assignedBy: req.user.fullName || 'Mentor',
      status: 'Pending',
      xpReward: xpReward || 150,
      coinReward: coinReward || 50,
      createdAt: new Date()
    };
    tasks.push(newTask);
    student.assignedTasks = tasks;
    student.changed('assignedTasks', true);
    await student.save();

    // We can create a notification for the student
    const notification = await Notification.create({
      userId: student.id,
      message: `🎯 New Mentor Task assigned: "${title}" (Due: ${newTask.dueDate})`,
      type: 'doubt',
      unread: true,
      actionTab: 'progress'
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user-${student.id}`).emit('new-notification', notification);
    }

    return res.json({ message: 'Task assigned successfully.', task: newTask });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error assigning challenge.' });
  }
});

// Update student task status (Student user only)
router.post('/update-tasks', authMiddleware, async (req, res) => {
  try {
    const { assignedTasks } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const oldTasks = user.assignedTasks || [];
    let xpGranted = 0;
    let coinsGranted = 0;

    assignedTasks.forEach((task) => {
      const old = oldTasks.find(o => o.id === task.id);
      if (task.status === 'Completed' && (!old || old.status !== 'Completed')) {
        xpGranted += task.xpReward || 50;
        coinsGranted += task.coinReward || 20;
      }
    });

    user.assignedTasks = assignedTasks;
    user.changed('assignedTasks', true);

    if (xpGranted > 0) {
      user.xp = (user.xp || 0) + xpGranted;
      user.focusCoins = (user.focusCoins || 0) + coinsGranted;
      const nextLevelXp = user.level * 1000;
      if (user.xp >= nextLevelXp) {
        user.level = user.level + 1;
      }
    }

    await user.save();
    return res.json({ message: 'Tasks updated successfully!', user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error updating tasks.' });
  }
});

// Toggle Campus Ambassador Status (Mentor/Admin only)
router.post('/toggle-ambassador', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'mentor' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Mentor or Administrator privileges required.' });
    }
    const { studentId } = req.body;
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required.' });
    }

    const student = await User.findByPk(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ error: 'Student not found.' });
    }

    // Toggle badge
    let badges = [];
    try {
      badges = JSON.parse(student.badges || '[]');
    } catch (e) {
      badges = [];
    }

    const index = badges.findIndex(b => b === 'Campus Ambassador' || (b && b.id === 'campus_ambassador'));
    let isAmbassador = false;
    if (index > -1) {
      badges.splice(index, 1);
    } else {
      badges.push({ id: 'campus_ambassador', earnedAt: getTodayISTString(), name: 'Campus Ambassador' });
      isAmbassador = true;
    }
    student.badges = JSON.stringify(badges);
    await student.save();

    // Create notification
    const notification = await Notification.create({
      userId: student.id,
      message: isAmbassador 
        ? '👑 Congratulations! You have been appointed as a Campus Ambassador!' 
        : 'Ambassador status removed from your profile.',
      type: 'system',
      unread: true,
      actionTab: 'profile'
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user-${student.id}`).emit('new-notification', notification);
    }

    return res.json({ 
      message: isAmbassador ? 'User is now a Campus Ambassador!' : 'Ambassador status removed.',
      badges
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error toggling ambassador status.' });
  }
});

// Get Pending Approvals (Admin only)
router.get('/pending-approvals', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    }
    const pendingUsers = await User.findAll({
      where: { isApproved: false },
      attributes: ['id', 'fullName', 'username', 'role', 'createdAt']
    });
    return res.json({ pendingUsers });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error retrieving pending approvals.' });
  }
});

// Get System Health Metrics (Admin only)
router.get('/system-health', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    }
    return res.json({
      status: 'Healthy',
      storageUsed: '68%',
      backupStatus: 'Completed',
      avgResponseTime: '120 ms',
      uptime: '99.98%'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error retrieving system health metrics.' });
  }
});

// Get Recent Platform Activities (Admin only)
router.get('/platform-activities', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    }
    const users = await User.findAll({ limit: 5, order: [['createdAt', 'DESC']] });
    const groups = await Group.findAll({ limit: 5, order: [['createdAt', 'DESC']] });
    
    const activities = [];
    
    users.forEach(u => {
      activities.push({
        id: `u-${u.id}`,
        title: u.role === 'mentor' ? 'New Mentor Signed Up' : 'New Student Registered',
        description: `${u.fullName} (@${u.username}) joined the platform.`,
        user: u.fullName,
        createdAt: u.createdAt
      });
    });
    
    groups.forEach(g => {
      activities.push({
        id: `g-${g.id}`,
        title: 'Study Room Created',
        description: `"${g.name}" study circle room was created.`,
        user: 'System',
        createdAt: g.createdAt
      });
    });
    
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return res.json({ activities: activities.slice(0, 10) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error retrieving platform activities.' });
  }
});

// Broadcast Announcement (Admin only)
router.post('/broadcast-announcement', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    }
    const { title, message, target } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required.' });
    }

    let usersQuery = {};
    if (target === 'student') {
      usersQuery = { role: 'student' };
    } else if (target === 'mentor') {
      usersQuery = { role: 'mentor' };
    }

    const targetUsers = await User.findAll({ where: usersQuery });
    
    // Create notifications for each target user
    await Promise.all(
      targetUsers.map(u => 
        Notification.create({
          userId: u.id,
          message: `[Announcement] ${title}: ${message}`,
          type: 'announcement',
          unread: true
        })
      )
    );

    const io = req.app.get('io');
    if (io) {
      targetUsers.forEach(u => {
        io.to(`user-${u.id}`).emit('new-notification', {
          message: `[Announcement] ${title}: ${message}`,
          type: 'announcement',
          unread: true
        });
      });
    }

    return res.json({ message: `Successfully broadcasted to ${targetUsers.length} users!`, count: targetUsers.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error broadcasting announcement.' });
  }
});

// Approve User Registration (Admin only)
router.post('/approve', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    }
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    user.isApproved = true;
    await user.save();

    try {
      const notification = await Notification.create({
        userId: user.id,
        message: 'Your account registration has been approved by the administrator!',
        type: 'system',
        unread: true,
        actionTab: 'profile'
      });
      const io = req.app.get('io');
      if (io) {
        io.to(`user-${user.id}`).emit('new-notification', notification);
      }
    } catch (notifErr) {
      console.error('[Notifier] Error sending approval notification:', notifErr);
    }

    return res.json({ message: `Successfully approved user @${user.username}!` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error approving user.' });
  }
});

// Reject User Registration (Admin only)
router.post('/reject', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    }
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    await user.destroy();
    return res.json({ message: `Rejected and removed user @${user.username}!` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error rejecting user.' });
  }
});

// POST /api/auth/google
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Google credential token is required.' });
    }

    let payload = null;

    if (credential && credential.startsWith('mock_google_credential_token')) {
      console.log('[Google Auth] Using local sandbox verification fallback.');
      const parts = credential.split(':');
      let email = 'student.demo@studycircle.com';
      let name = 'Vijay Kumar (Google Demo)';
      let gender = 'male';
      if (parts.length >= 3) {
        email = parts[1];
        name = parts[2];
      }
      if (parts.length >= 4) {
        gender = parts[3];
      }

      let picture = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236B7280"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
      if (gender === 'female') {
        picture = '/swathi-avatar.png';
      } else if (gender === 'male') {
        picture = '/charan-avatar.png';
      }

      payload = {
        email: email,
        name: name,
        picture: picture,
        gender: gender
      };
    } else {
      const { OAuth2Client } = require('google-auth-library');
      const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

      if (!clientId) {
        console.warn('[Google Auth] GOOGLE_CLIENT_ID not configured on backend.');
        return res.status(400).json({ error: 'Google Sign-In is not configured yet. Please use Email & Password login.' });
      }

      const client = new OAuth2Client(clientId);

      try {
        const ticket = await client.verifyIdToken({
          idToken: credential,
          audience: clientId
        });
        payload = ticket.getPayload();
      } catch (err) {
        console.error('[Google Auth] OAuth2Client verification failed:', err);
        return res.status(400).json({ error: 'Failed to verify Google ID Token. Please try again.' });
      }
    }

    if (!payload || !payload.email) {
      return res.status(400).json({ error: 'Invalid Google payload data.' });
    }

    const email = payload.email.trim().toLowerCase();
    const fullName = payload.name || 'Google Student';
    
    // Find user
    let user = await User.findOne({
      where: {
        [Op.or]: [
          { email: email },
          { phoneOrEmail: email },
          { username: email }
        ]
      }
    });

    if (!user) {
      const crypto = require('crypto');
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || 'Google';
      const lastName = nameParts.slice(1).join(' ') || 'Student';
      
      let baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      if (!baseUsername) {
        baseUsername = 'user';
      }
      let username = baseUsername;
      let counter = 1;
      while (true) {
        const existing = await User.findOne({ where: { username } });
        if (!existing) {
          break;
        }
        username = `${baseUsername}${counter}`;
        counter++;
      }

      const defaultMissions = [
        { id: 'join_circle', text: 'Join Study Circle', completed: false, xp: 30 },
        { id: 'attend_session', text: 'Attend Session', completed: false, xp: 30 },
        { id: 'upload_notes', text: 'Upload Notes', completed: false, xp: 40 },
        { id: 'complete_session', text: 'Complete Session', completed: false, xp: 50 }
      ];

      user = await User.create({
        fullName: fullName.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username,
        password: randomPassword,
        role: 'student',
        phoneOrEmail: email,
        email: email,
        isVerified: true,
        isApproved: true,
        gender: payload.gender || 'other',
        avatarUrl: payload.picture || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236B7280"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>',
        provider: 'google',
        dailyMissions: defaultMissions,
        dailyMissionDate: getTodayISTString()
      });

      // Add to Bloom Filter
      if (bloomFilter && typeof bloomFilter.add === 'function') {
        bloomFilter.add(username);
      }
    }

    // Reset daily missions if a new day has arrived
    await checkAndResetDailyMissions(user);

    const token = signToken(user, false);
    const refreshToken = jwt.sign(
      { id: user.id, type: 'refresh', rememberMe: false },
      process.env.JWT_REFRESH_SECRET || 'refresh_secret_study_circle_2026',
      { expiresIn: '7d' }
    );

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.json({
      message: 'Google login successful!',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        role: user.role,
        isApproved: user.isApproved,
        streakCount: user.streakCount,
        totalStudyHours: user.totalStudyHours,
        avatarUrl: user.avatarUrl,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        learningGoal: user.learningGoal,
        learningLevel: user.learningLevel,
        dailyTarget: user.dailyTarget,
        dailyMissions: user.dailyMissions,
        dailyMissionDate: user.dailyMissionDate
      }
    });
  } catch (err) {
    console.error('[Google Auth Error]:', err);
    return res.status(500).json({ error: 'Server error during Google Login.' });
  }
});

// Route: Get public profile details by username
router.get('/profile/:username', authMiddleware, async (req, res) => {
  try {
    const { username } = req.params;
    const normalizedUsername = username.trim().toLowerCase();

    const user = await User.findOne({
      where: { username: normalizedUsername },
      attributes: ['id', 'fullName', 'username', 'role', 'streakCount', 'totalStudyHours', 'avatarUrl', 'gender', 'bio', 'department', 'badges', 'level', 'xp', 'learningGoal']
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    let publicData = {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      role: user.role,
      streakCount: user.streakCount || 0,
      totalStudyHours: user.totalStudyHours || 0.0,
      avatarUrl: user.avatarUrl,
      gender: user.gender,
      bio: user.bio,
      department: user.department,
      badges: user.badges || '[]',
      level: user.level || 1,
      xp: user.xp || 0,
      learningGoal: user.learningGoal
    };

    if (user.role === 'mentor' || user.role === 'admin') {
      const { Answer, Session, MentorRating } = require('../models');

      // 1. Accepted answers (doubts solved)
      const doubtsSolved = await Answer.count({
        where: { userId: user.id, isAccepted: true }
      });

      // 2. Sessions held
      const sessionsHeld = await Session.count({
        where: { createdBy: user.id }
      });

      // 3. Average rating
      const ratings = await MentorRating.findAll({
        where: { mentorId: user.id }
      });
      const avgRating = ratings.length > 0
        ? Number((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1))
        : 5.0;

      // 4. Mentor Reputation Score
      // Formula: (Doubts Solved * 50) + (Sessions Held * 30) + (Avg Rating * 100)
      const reputationScore = Math.round((doubtsSolved * 50) + (sessionsHeld * 30) + (avgRating * 100));

      publicData.reputation = {
        doubtsSolved,
        sessionsHeld,
        avgRating,
        reputationScore
      };
    }

    return res.json({ profile: publicData });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error retrieving public profile.' });
  }
});

// Route: Rate a mentor (Students only)
router.post('/mentors/:mentorId/rate', authMiddleware, async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { rating, feedback } = req.body;

    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can submit ratings for mentors.' });
    }

    if (rating === undefined || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
    }

    const mentor = await User.findByPk(mentorId);
    if (!mentor || (mentor.role !== 'mentor' && mentor.role !== 'admin')) {
      return res.status(404).json({ error: 'Mentor not found.' });
    }

    const { MentorRating } = require('../models');

    // Upsert rating
    const [ratingRecord, created] = await MentorRating.findOrCreate({
      where: { mentorId, studentId: req.user.id },
      defaults: { rating, feedback }
    });

    if (!created) {
      ratingRecord.rating = rating;
      ratingRecord.feedback = feedback;
      await ratingRecord.save();
    }

    return res.json({
      message: created ? 'Rating submitted successfully!' : 'Rating updated successfully!',
      rating: ratingRecord
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error submitting mentor rating.' });
  }
});

// Route: Get feedback/ratings list for a mentor
router.get('/mentors/:mentorId/ratings', authMiddleware, async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { MentorRating } = require('../models');

    const ratings = await MentorRating.findAll({
      where: { mentorId },
      include: [{
        model: User,
        as: 'Student',
        attributes: ['fullName', 'username', 'avatarUrl', 'gender']
      }],
      order: [['createdAt', 'DESC']]
    });

    return res.json({ ratings });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error retrieving mentor ratings.' });
  }
});

// Authenticated Change Password
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect current password.' });
    }

    user.password = newPassword;
    await user.save();

    return res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error during password update.' });
  }
});

// GET /recent-activity
router.get('/recent-activity', authMiddleware, async (req, res) => {
  try {
    const { Session, Assignment, Answer, SharedNote, Doubt } = require('../models');
    
    // 1. Fetch sessions
    const sessions = await Session.findAll({
      where: { createdBy: req.user.id },
      limit: 10,
      order: [['createdAt', 'DESC']]
    });

    // 2. Fetch assignments
    const assignments = await Assignment.findAll({
      where: { createdBy: req.user.id },
      limit: 10,
      order: [['createdAt', 'DESC']]
    });

    // 3. Fetch answers
    const answers = await Answer.findAll({
      where: { userId: req.user.id },
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [{ model: Doubt, attributes: ['title'] }]
    });

    // 4. Fetch shared notes
    const user = await User.findByPk(req.user.id);
    const notes = user ? await SharedNote.findAll({
      where: { publishedBy: user.username },
      limit: 10,
      order: [['createdAt', 'DESC']]
    }) : [];

    // Merge and format
    const activities = [];

    sessions.forEach(s => {
      activities.push({
        type: 'session',
        title: 'Created Study Session',
        description: s.title,
        createdAt: s.createdAt
      });
    });

    assignments.forEach(a => {
      activities.push({
        type: 'assignment',
        title: 'Assigned Practice',
        description: a.title,
        createdAt: a.createdAt
      });
    });

    answers.forEach(an => {
      activities.push({
        type: 'answer',
        title: 'Answered Discussion',
        description: an.Doubt ? an.Doubt.title : 'Discussion Thread',
        createdAt: an.createdAt
      });
    });

    notes.forEach(n => {
      activities.push({
        type: 'note',
        title: 'Uploaded Resource',
        description: n.name,
        createdAt: n.createdAt
      });
    });

    // Sort by date descending
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Limit to 5 items
    return res.json({ activities: activities.slice(0, 5) });
  } catch (err) {
    console.error(err);
    return res.status(550).json({ error: 'Server error retrieving recent activity.' });
  }
});

module.exports = router;
