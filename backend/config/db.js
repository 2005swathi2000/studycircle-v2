const { Sequelize } = require('sequelize');
const path = require('path');

let sequelize;

if (process.env.DATABASE_URL) {
  // Production (PostgreSQL on Supabase/Neon)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  });
} else {
  // Local Development (SQLite)
  const storagePath = process.env.SQLITE_DB_PATH || path.join(__dirname, '..', 'database.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: false
  });
}

module.exports = sequelize;
