const { User } = require('./models');
const { Op } = require('sequelize');

const cleanup = async () => {
  try {
    const deletedCount = await User.destroy({
      where: {
        [Op.or]: [
          { username: 'Swathi_Hani21' },
          { username: 'swathi_hani21' },
          { username: 'swathi_test21' },
          { email: 'hanumanthuswathi24@gmail.com' },
          { email: 'swathi.hani21@gmail.com' }
        ]
      }
    });
    console.log(`Cleaned up ${deletedCount} users from database.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

cleanup();
