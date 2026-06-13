const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

async function checkUsers() {
  try {
    const [results] = await sequelize.query("SELECT id, username, fullName, role FROM Users;");
    console.log("Registered Users in Database:");
    console.log(results);
  } catch (err) {
    console.error("Error querying database:", err);
  } finally {
    await sequelize.close();
  }
}

checkUsers();
