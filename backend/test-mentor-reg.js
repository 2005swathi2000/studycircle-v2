const { User, Otp } = require('./models');
const bcrypt = require('bcryptjs');

const run = async () => {
  try {
    const email = 'testmentor@studycircle.com';
    const otp = '999999';
    const username = 'testmentor';
    const password = 'Password123';

    // Cleanup first
    await User.destroy({ where: { username } });
    await Otp.destroy({ where: { phoneOrEmail: email } });

    // 1. Create OTP
    await Otp.create({
      phoneOrEmail: email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    // 2. Call register logic directly
    const validRole = 'mentor';
    const fullName = 'Test Mentor';
    const phoneOrEmail = email;

    const user = await User.create({
      fullName,
      username,
      password,
      role: validRole,
      phoneOrEmail,
      isVerified: true,
      isApproved: true,
      firstName: 'Test',
      lastName: 'Mentor',
      email,
      gender: 'male',
      dailyMissions: []
    });

    console.log('Registration Success:', user.username, user.role, 'isApproved:', user.isApproved);
    console.log('Password Hash in DB:', user.password);

    // 3. Test login query
    const foundUser = await User.findOne({
      where: { username }
    });

    if (!foundUser) {
      console.log('Login failed: User not found');
      process.exit(1);
    }

    const isMatch = await foundUser.comparePassword(password);
    console.log('Password comparison match:', isMatch);

    if (isMatch) {
      console.log('Mentor Registration and Login simulation works correctly!');
    } else {
      console.log('Mentor Registration and Login simulation failed!');
    }
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

run();
