const { User, Otp } = require('./models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const testRegisterLogin = async () => {
  try {
    const contact = 'swathi.test@example.com';
    const otpVal = '123456';
    const username = 'swathi_test21';
    const password = 'Swathi@123';

    // 1. Create a mock OTP record in the DB
    await Otp.upsert({
      phoneOrEmail: contact,
      otp: otpVal,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });
    console.log('Mock OTP record upserted.');

    // 2. Perform the register flow logic
    // We check if username is already taken (in lowercase)
    const normalizedUsername = username.trim().toLowerCase();
    const existingUser = await User.findOne({ where: { username: normalizedUsername } });
    if (existingUser) {
      console.log('User already exists, deleting it to start fresh...');
      await User.destroy({ where: { username: normalizedUsername } });
    }

    const otpRecord = await Otp.findOne({ where: { phoneOrEmail: contact } });
    if (!otpRecord || otpRecord.otp !== otpVal) {
      console.log('Invalid OTP record!');
      process.exit(1);
    }
    
    // Create user like routes/auth.js does
    const newUser = await User.create({
      fullName: 'Swathi Test',
      username: normalizedUsername,
      password: password, // hooks should hash this!
      role: 'student',
      phoneOrEmail: contact,
      isVerified: true,
      isApproved: true,
      firstName: 'Swathi',
      lastName: 'Test',
      email: contact,
      gender: 'female',
      avatarUrl: '/swathi-avatar.png'
    });

    console.log('User registered in DB:');
    console.log('Stored username:', newUser.username);
    console.log('Stored password hash:', newUser.password);

    // 3. Test login query and compare password
    const searchUsername = 'swathi_test21';
    const searchPassword = 'Swathi@123';
    const normalizedSearch = searchUsername.trim().toLowerCase();

    const loggedUser = await User.findOne({
      where: {
        [Op.or]: [
          { username: normalizedSearch },
          { email: normalizedSearch },
          { phoneOrEmail: normalizedSearch }
        ]
      }
    });

    if (!loggedUser) {
      console.log('Login failed: User not found!');
      process.exit(1);
    }

    console.log('Login found user in DB:');
    console.log('User details:', loggedUser.username, loggedUser.email);

    const isMatch = await loggedUser.comparePassword(searchPassword);
    console.log('Password isMatch result:', isMatch);

    if (isMatch) {
      console.log('SUCCESS: Registration and Login simulation works correctly!');
    } else {
      console.log('FAILURE: Password comparison failed!');
    }
    process.exit(0);
  } catch (err) {
    console.error('Error during test:', err);
    process.exit(1);
  }
};

testRegisterLogin();
