const { sequelize } = require('./models');
const { seedDatabase } = require('./utils/seeder');

const forceSeed = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced forcefully.');
    await seedDatabase();
    console.log('Reseeded successfully.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

forceSeed();
