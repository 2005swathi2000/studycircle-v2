const { User } = require('./models');

const getTodayISTString = () => {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata"
  });
};

const calculateLevel = (xp) => {
  return 1;
};

const checkAndResetDailyMissions = async (user) => {
  const todayStr = getTodayISTString();
  if (user.role === 'student' && user.dailyMissionDate !== todayStr) {
    user.dailyMissions = [
      { id: 'join_circle', text: 'Join Study Circle', completed: false, xp: 30 },
      { id: 'attend_session', text: 'Attend Session', completed: false, xp: 30 },
      { id: 'upload_notes', text: 'Upload Notes', completed: false, xp: 40 },
      { id: 'complete_session', text: 'Complete Session', completed: false, xp: 50 }
    ];
    user.dailyMissionDate = todayStr;
    user.dailyXpEarned = 5;
    user.focusCoins = (user.focusCoins || 0) + 5;
    user.xp = (user.xp || 0) + 5;
    user.level = calculateLevel(user.xp);
    
    await user.save();
  }
};

const testReset = async () => {
  try {
    const username = 'swathi_hani21';
    let user = await User.findOne({ where: { username } });
    if (!user) {
      console.log(`User ${username} not found.`);
      process.exit(1);
    }
    
    // Set dailyMissionDate to yesterday so it triggers the reset
    user.dailyMissionDate = '2020-01-01';
    await user.save();
    
    // Fetch user again to get a fresh instance
    user = await User.findOne({ where: { username } });
    const originalHash = user.password;
    console.log('Original Hash:', originalHash);
    
    // Call reset
    await checkAndResetDailyMissions(user);
    
    // Fetch again
    user = await User.findOne({ where: { username } });
    const afterResetHash = user.password;
    console.log('After Reset Hash:', afterResetHash);
    
    if (originalHash === afterResetHash) {
      console.log('SUCCESS: Password did not change.');
    } else {
      console.log('FAILURE: PASSWORD HASH CHANGED! Original:', originalHash, 'After:', afterResetHash);
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

testReset();
