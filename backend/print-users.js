const { User, sequelize } = require('./models');
const { Op } = require('sequelize');

async function run() {
  try {
    await sequelize.authenticate();
    const users = await User.findAll();
    console.log('--- Current Users in Database ---');
    for (const u of users) {
      console.log(`Username: ${u.username}`);
      console.log(`  Full Name: ${u.fullName}`);
      console.log(`  Streak Count: ${u.streakCount}`);
      console.log(`  Last Study Date: "${u.lastStudyDate}"`);
      console.log(`  Null Check: ${u.lastStudyDate === null}`);
      console.log(`  Empty Check: ${u.lastStudyDate === ''}`);
      console.log('---------------------------------');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
