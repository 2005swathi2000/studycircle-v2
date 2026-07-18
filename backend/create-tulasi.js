const { User } = require('./models');

const createTulasi = async () => {
  try {
    // Delete case-sensitive mismatch if exists
    await User.destroy({ where: { username: 'Tulasi' } });
    await User.destroy({ where: { username: 'tulasi' } });

    await User.create({
      fullName: 'Tulasi Devi',
      username: 'tulasi',
      password: 'Tulasi@123',
      role: 'admin',
      phoneOrEmail: 'tulasi.admin@studycircle.com',
      isVerified: true,
      isApproved: true,
      streakCount: 15,
      totalStudyHours: 120.0
    });
    console.log('Tulasi admin user created successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error creating user Tulasi:', err);
    process.exit(1);
  }
};

createTulasi();
