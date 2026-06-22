const { User } = require('./models');

const createSwathi = async () => {
  try {
    const existing = await User.findOne({ where: { username: 'Swathi_Hani21' } });
    if (existing) {
      console.log('Swathi user already exists.');
      process.exit(0);
    }
    await User.create({
      fullName: 'Swathi Hani',
      username: 'Swathi_Hani21',
      password: 'Swathi@123',
      role: 'student',
      phoneOrEmail: 'swathi.hani21@gmail.com',
      isVerified: true,
      isApproved: true,
      email: 'swathi.hani21@gmail.com',
      streakCount: 0,
      totalStudyHours: 0.0
    });
    console.log('Swathi user created successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error creating user Swathi:', err);
    process.exit(1);
  }
};

createSwathi();
