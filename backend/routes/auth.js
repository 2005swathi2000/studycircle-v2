const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { authMiddleware } = require('../middleware/auth');
const BloomFilter = require('../utils/bloom');
const { sendMail, sendSMS, hasSmtpConfig } = require('../utils/notifier');

const router = express.Router();
const bloomFilter = new BloomFilter(2048);
const otpCache = new Map(); // value -> { otp, expiresAt }
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

const signToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET || 'super_secret_study_circle_token_2026_key_ap_telangana',
    { expiresIn: '7d' }
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

// Route: Send OTP (Mock SMS/Email gateway)
router.post('/send-otp', async (req, res) => {
  try {
    const { type, value, username, isReset } = req.body;
    let targetValue = value;

    if (isReset && username) {
      const user = await User.findOne({ where: { username: username.trim().toLowerCase() } });
      if (!user) {
        return res.status(404).json({ error: 'Username not found.' });
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
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 min expiry

    otpCache.set(trimmedValue, { otp, expiresAt });
    console.log(`[OTP DEBUG] Sent ${type || 'Verification'} OTP: ${otp} to: ${trimmedValue}`);

    // Check target type (Email or Phone)
    const isEmail = trimmedValue.includes('@');
    let isRealSent = false;

    if (isEmail) {
      const subject = isReset ? 'StudyCircle: Password Reset Request' : 'StudyCircle: Verify Your Account';
      const body = `Hi there,\n\nYour StudyCircle verification code is: ${otp}.\n\nThis code is valid for 5 minutes. If you did not request this, please ignore this email.\n\nWarm regards,\nStudyCircle Team`;
      isRealSent = await sendMail(trimmedValue, subject, body);
    } else {
      const body = `Your StudyCircle verification code is: ${otp}. Valid for 5 minutes.`;
      isRealSent = await sendSMS(trimmedValue, body);
    }

    const isMocked = !isRealSent;

    if (isMocked) {
      // Record to mock email inbox
      emailInbox.unshift({
        id: Date.now().toString(),
        to: trimmedValue,
        subject: isReset ? 'StudyCircle: Password Reset Request' : 'StudyCircle: Verify Your Account',
        body: `Hi there,\n\nYour StudyCircle verification code is: ${otp}.\n\nThis code is valid for 5 minutes. If you did not request this request, please ignore this email.\n\nWarm regards,\nStudyCircle Team`,
        otp,
        createdAt: new Date().toLocaleTimeString()
      });
    }

    let successMessage = isRealSent
      ? `OTP sent successfully to ${trimmedValue}!`
      : `OTP sent successfully to mock inbox for ${trimmedValue}!`;

    if (isRealSent && isEmail && !hasSmtpConfig()) {
      successMessage = `OTP sent to ${trimmedValue}! First time? Please check your email (and spam folder) to 'Activate' FormSubmit.co to receive the code.`;
    }

    return res.json({
      message: successMessage,
      debugOtp: isMocked ? otp : undefined,
      email: trimmedValue,
      isMocked
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

// Register Route
router.post('/register', async (req, res) => {
  try {
    const { fullName, username, password, role, phoneOrEmail, otp } = req.body;

    if (!fullName || !username || !password) {
      return res.status(400).json({ error: 'All fields (fullName, username, password) are required.' });
    }

    const normalizedUsername = username.trim().toLowerCase();
    const validRole = (role === 'admin' || role === 'mentor' || role === 'student') ? role : 'student';

    // Verification check for all accounts
    if (!phoneOrEmail || !otp) {
      return res.status(400).json({ error: 'Email or phone number and OTP are required for registration.' });
    }
    
    const cached = otpCache.get(phoneOrEmail.trim().toLowerCase());
    if (!cached || cached.otp !== otp || Date.now() > cached.expiresAt) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }
    
    // Burn OTP on use
    otpCache.delete(phoneOrEmail.trim().toLowerCase());

    // Check if username already exists
    const existingUser = await User.findOne({ where: { username: normalizedUsername } });
    if (existingUser) {
      return res.status(400).json({ error: 'Username is already taken.' });
    }

    // All users are approved immediately to facilitate testing and workspace entry
    let isApproved = true;

    // Create user
    const newUser = await User.create({
      fullName,
      username: normalizedUsername,
      password,
      role: validRole,
      phoneOrEmail: phoneOrEmail ? phoneOrEmail.trim().toLowerCase() : null,
      isVerified: true,
      isApproved
    });

    // Add new username to Bloom Filter
    bloomFilter.add(normalizedUsername);

    const token = signToken(newUser);

    // Set HttpOnly cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(201).json({
      message: isApproved 
        ? 'Registration successful!' 
        : 'Registration successful! Account is pending approval by an existing admin.',
      token,
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        username: newUser.username,
        role: newUser.role,
        isApproved: newUser.isApproved
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { username, password, portal } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const normalizedUsername = username.trim().toLowerCase();

    const user = await User.findOne({ where: { username: normalizedUsername } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid username or password.' });
    }

    // Enforce Portal Restrictions / Role Separation
    if (portal === 'student') {
      if (user.role !== 'student') {
        return res.status(403).json({ error: 'This portal is only for students. Mentors and Admins must login via the right portal.' });
      }
    } else if (portal === 'mentor') {
      if (user.role !== 'mentor' && user.role !== 'admin') {
        return res.status(403).json({ error: 'This portal is only for mentors and administrators. Students must login via the left portal.' });
      }
    }

    // Block non-approved accounts
    if (!user.isApproved) {
      return res.status(403).json({ error: 'Your account is pending administrator approval. Please contact an existing admin.' });
    }

    const token = signToken(user);

    // Set cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
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
        totalStudyHours: user.totalStudyHours
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
    sameSite: isProduction ? 'none' : 'lax'
  });
  return res.json({ message: 'Logged out successfully!' });
});

// Reset Password Route
router.post('/reset-password', async (req, res) => {
  try {
    const { username, newPassword, otp } = req.body;

    if (!username || !newPassword || !otp) {
      return res.status(400).json({ error: 'Username, new password, and OTP verification code are required.' });
    }

    const normalizedUsername = username.trim().toLowerCase();

    const user = await User.findOne({ where: { username: normalizedUsername } });
    if (!user) {
      return res.status(404).json({ error: 'Username not found.' });
    }

    if (!user.phoneOrEmail) {
      return res.status(400).json({ error: 'No verification contact registered for this account.' });
    }

    const cached = otpCache.get(user.phoneOrEmail.trim().toLowerCase());
    if (!cached || cached.otp !== otp || Date.now() > cached.expiresAt) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    // Burn OTP
    otpCache.delete(user.phoneOrEmail.trim().toLowerCase());

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
    return res.json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error retrieving user profile.' });
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

    return res.json({ message: `Successfully approved user @${user.username}!` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error approving user.' });
  }
});

module.exports = router;
