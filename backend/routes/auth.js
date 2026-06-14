const express = require('express');
const jwt = require('jsonwebtoken');
const dns = require('dns').promises;
const { User, Otp } = require('../models');
const { authMiddleware } = require('../middleware/auth');
const BloomFilter = require('../utils/bloom');
const { sendMail, sendSMS, hasSmtpConfig } = require('../utils/notifier');
const rateLimit = require('express-rate-limit');

const router = express.Router();
const bloomFilter = new BloomFilter(2048);
let lastEmailError = null;

const checkDomainMx = async (domain) => {
  try {
    const records = await dns.resolveMx(domain);
    return records && records.length > 0;
  } catch (err) {
    return false;
  }
};

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP or contact to 100 send-otp requests per windowMs for testing
  message: { error: 'Too many OTP requests from this IP. Please try again after 15 minutes.' },
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

    // Validate format
    const isEmail = trimmedValue.includes('@');
    if (isEmail) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
        return res.status(400).json({ error: 'Invalid email, please check and try again!' });
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
        if (!isRealSent) {
          lastEmailError = mailResult.error || 'Unknown sendMail error';
        }
      } else {
        const body = `Your StudyCircle verification code is: ${otp}. Valid for 5 minutes.`;
        isRealSent = await sendSMS(trimmedValue, body);
        deliveryMethod = isRealSent ? 'sms' : 'mock';
      }

      // If a real contact was specified, but we failed to send the real OTP, return error immediately
      if (isReal && !isRealSent) {
        return res.status(400).json({ error: 'Invalid email, please check and try again!' });
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

router.get('/debug-env', (req, res) => {
  res.json({
    brevoKeyExists: !!process.env.BREVO_API_KEY,
    smtpUser: process.env.SMTP_USER,
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    hasSmtp: !!(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS),
    nodeEnv: process.env.NODE_ENV,
    lastEmailError
  });
});

module.exports = router;
