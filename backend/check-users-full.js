const { User } = require('./models');

const run = async () => {
  try {
    const users = await User.findAll();
    console.log('=== All Users in DB ===');
    users.forEach(u => {
      console.log({
        id: u.id,
        fullName: u.fullName,
        username: u.username,
        email: u.email,
        phone: u.phone,
        role: u.role,
        isApproved: u.isApproved,
        isVerified: u.isVerified,
        passwordHash: u.password ? u.password.substring(0, 15) + '...' : null
      });
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
