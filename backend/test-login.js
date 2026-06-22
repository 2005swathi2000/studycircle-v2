const { User } = require('./models');
const { Op } = require('sequelize');

const testLogin = async () => {
  try {
    const username = 'Swathi_Hani21';
    const password = 'Swathi@123';
    
    const normalizedUsername = username.trim().toLowerCase();
    console.log('Normalized search username:', normalizedUsername);
    
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
      console.log('User not found!');
      process.exit(0);
    }
    
    console.log('User found in DB:');
    console.log('Username:', user.username);
    console.log('Email:', user.email);
    console.log('Password hash in DB:', user.password);
    
    const isMatch = await user.comparePassword(password);
    console.log('Password compare match:', isMatch);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

testLogin();
