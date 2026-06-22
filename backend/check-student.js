const { User } = require('./models');

const updateStudent = async () => {
  try {
    const user = await User.findOne({
      where: { username: 'student.demo@studycircle.com' }
    });
    if (user) {
      user.focusCoins = 1000;
      user.xp = 500;
      user.level = 5;
      await user.save();
      console.log('Successfully updated student:', {
        username: user.username,
        focusCoins: user.focusCoins,
        xp: user.xp,
        level: user.level,
        badges: user.badges
      });
    } else {
      console.log('Student not found');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

updateStudent();
