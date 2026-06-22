const { User } = require('./models');

const dumpUsers = async () => {
  try {
    const users = await User.findAll();
    console.log(`Found ${users.length} users in DB:`);
    users.forEach(u => {
      console.log({
        id: u.id,
        fullName: u.fullName,
        username: u.username,
        email: u.email,
        password: u.password,
        role: u.role
      });
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

dumpUsers();
