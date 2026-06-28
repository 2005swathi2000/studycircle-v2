const { User } = require('./models');

const testSave = async () => {
  try {
    const username = 'swathi_hani21';
    let user = await User.findOne({ where: { username } });
    if (!user) {
      console.log(`User ${username} not found.`);
      process.exit(1);
    }
    
    const originalHash = user.password;
    console.log('Original Password Hash:', originalHash);
    
    // Change a non-password field
    user.streakCount = (user.streakCount || 0) + 1;
    await user.save();
    
    // Fetch again
    user = await User.findOne({ where: { username } });
    const afterSaveHash = user.password;
    console.log('Password Hash After Save:', afterSaveHash);
    
    if (originalHash === afterSaveHash) {
      console.log('SUCCESS: Password hash did NOT change.');
    } else {
      console.log('FAILURE: Password hash CHANGED! The hook re-hashed the password!');
    }
    
    // Revert change
    user.streakCount = user.streakCount - 1;
    await user.save();
    
    process.exit(0);
  } catch (err) {
    console.error('Error during test:', err);
    process.exit(1);
  }
};

testSave();
