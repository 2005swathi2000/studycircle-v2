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
    { expiresIn: rememberMe ? '30d' : '1d' }
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

    const normalizedUsername = username.trim().toLowerCase();
    const validRole = (role === 'admin' || role === 'mentor' || role === 'student') ? role : 'student';
    const normalizedGender = (gender === 'male' || gender === 'female' || gender === 'other') ? gender : 'other';

    // Calculate composite fields for backward compatibility
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const phoneOrEmail = (email || phone || '').trim().toLowerCase();

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
      avatarUrl
    });

    // Add new username to Bloom Filter
    bloomFilter.add(normalizedUsername);

    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: newUser.role },
      process.env.JWT_SECRET || 'super_secret_study_circle_token_2026_key_ap_telangana',
      { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
      { id: newUser.id, type: 'refresh', rememberMe: false },
      process.env.JWT_REFRESH_SECRET || 'refresh_secret_study_circle_2026',
      { expiresIn: '1d' }
    );

    // Set HttpOnly cookies
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000 // 15 mins
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
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
        gender: newUser.gender
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error during registration.' });
  }
});

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

    const remember = !!rememberMe;
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'super_secret_study_circle_token_2026_key_ap_telangana',
      { expiresIn: remember ? '1d' : '15m' }
    );
    const refreshToken = jwt.sign(
      { id: user.id, type: 'refresh', rememberMe: remember },
      process.env.JWT_REFRESH_SECRET || 'refresh_secret_study_circle_2026',
      { expiresIn: remember ? '30d' : '1d' }
    );

    // Set HttpOnly cookies
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: remember ? 24 * 60 * 60 * 1000 : 15 * 60 * 1000 // 1 day vs 15 min
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: remember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 30 days vs 1 day
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
        gender: user.gender
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
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax'
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
    const { firstName, lastName, email, phone, avatarUrl, bio } = req.body;
    
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

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

    if (email !== undefined) {
      user.email = email ? email.trim().toLowerCase() : null;
    }

    if (phone !== undefined) {
      user.phone = phone ? phone.trim() : null;
    }

    if (avatarUrl !== undefined) {
      user.avatarUrl = avatarUrl;
    }

    if (bio !== undefined) {
      user.bio = bio ? bio.trim() : null;
    }

    // Update old composite columns for backward compatibility
    const updatedFirstName = user.firstName || '';
    const updatedLastName = user.lastName || '';
    if (updatedFirstName || updatedLastName) {
      user.fullName = `${updatedFirstName} ${updatedLastName}`.trim();
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
      gender: user.gender
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
      attributes: ['id', 'fullName', 'username', 'email', 'phone', 'gender', 'streakCount', 'totalStudyHours', 'xp', 'focusCoins', 'level', 'department', 'badges', 'createdAt']
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
    const { studentId, challengeText, xpReward, coinReward } = req.body;
    if (!studentId || !challengeText) {
      return res.status(400).json({ error: 'Student ID and challenge description are required.' });
    }

    const student = await User.findByPk(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ error: 'Student user not found.' });
    }

    // We can create a notification for the student
    const notification = await Notification.create({
      userId: student.id,
      message: `🎯 New Mentor Challenge assigned: "${challengeText}" (Reward: ${xpReward || 150} XP, ${coinReward || 50} Focus Coins)`,
      type: 'doubt',
      unread: true,
      actionTab: 'progress'
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user-${student.id}`).emit('new-notification', notification);
    }

    return res.json({ message: `Successfully assigned challenge to student @${student.username}!` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error assigning challenge.' });
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

    const index = badges.indexOf('Campus Ambassador');
    let isAmbassador = false;
    if (index > -1) {
      badges.splice(index, 1);
    } else {
      badges.push('Campus Ambassador');
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

// POST /api/auth/google
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Google credential token is required.' });
    }

    let payload = null;

    if (credential === 'mock_google_credential_token') {
      console.log('[Google Auth] Using local sandbox verification fallback.');
      payload = {
        email: 'google.demo@studycircle.com',
        name: 'Google Demo Student',
        picture: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236B7280"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>'
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
    
    // Find or create user
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
      // Automatically register a new student user
      const usernameParts = email.split('@');
      const baseUsername = usernameParts[0].replace(/[^a-zA-Z0-9]/g, '');
      const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
      const username = `${baseUsername}${uniqueSuffix}`.toLowerCase();
      
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || 'Google';
      const lastName = nameParts.slice(1).join(' ') || 'Student';

      // Generate a secure random password
      const password = Math.random().toString(36).slice(-10) + 'Go1!';

      user = await User.create({
        fullName,
        username,
        password,
        role: 'student',
        phoneOrEmail: email,
        email: email,
        isVerified: true,
        isApproved: true, // Auto-approve Google student accounts
        firstName,
        lastName,
        gender: 'other',
        provider: 'google',
        avatarUrl: payload.picture || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236B7280"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>'
      });

      console.log(`[Google Auth] Created new user: @${username} (${email})`);
    } else {
      // If user exists and provider is local, link/update their provider to google
      if (!user.provider || user.provider === 'local') {
        user.provider = 'google';
        await user.save();
      }
    }

    const token = signToken(user, false);
    const refreshToken = jwt.sign(
      { id: user.id, type: 'refresh', rememberMe: false },
      process.env.JWT_REFRESH_SECRET || 'refresh_secret_study_circle_2026',
      { expiresIn: '1d' }
    );

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000 // 15 mins
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
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
        gender: user.gender
      }
    });
  } catch (err) {
    console.error('[Google Auth Error]:', err);
    return res.status(500).json({ error: 'Server error during Google Login.' });
  }
});

module.exports = router;
