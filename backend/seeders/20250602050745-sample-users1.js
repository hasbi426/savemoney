// backend/seeders/YYYYMMDDHHMMSS-sample-users.js (or your exact filename)
'use strict';
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

function getRandomBirthday() {
  const start = new Date(1970, 0, 1);
  const end = new Date(2005, 11, 31);
  const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return randomDate.toISOString().split('T')[0];
}

module.exports = {
  async up (queryInterface, Sequelize) {
    const usersToSeed = [];
    const commonPassword = 'password123';
    const hashedPassword = await hashPassword(commonPassword);

    console.log("--- Seeder: Preparing to seed users ---"); // <--- ADD DEBUG LOG

    for (let i = 1; i <= 35; i++) {
      usersToSeed.push({
        id: uuidv4(),
        name: `Test User ${i}`,
        birthday: getRandomBirthday(),
        email: `testuser${i}@example.com`,
        password: hashedPassword,
        // Ensure these match your DB column names from the migration
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    if (usersToSeed.length > 0) {
      console.log(`--- Seeder: Attempting to bulkInsert ${usersToSeed.length} users. First user:`, JSON.stringify(usersToSeed[0])); // <--- ADD DEBUG LOG
      try {
        await queryInterface.bulkInsert('users', usersToSeed, {});
        console.log("--- Seeder: bulkInsert command executed successfully. ---"); // <--- ADD DEBUG LOG
      } catch (error) {
        console.error("--- Seeder: Error during bulkInsert: ---", error); // <--- ADD DEBUG LOG FOR ERRORS
        throw error; // Re-throw the error so Sequelize CLI knows it failed
      }
    } else {
      console.log("--- Seeder: No users generated to seed. ---"); // <--- ADD DEBUG LOG
    }
  },

  async down (queryInterface, Sequelize) {
    console.log("--- Seeder: Undoing - Deleting users ---"); // <--- ADD DEBUG LOG
    // To delete only the specific seeded users (safer if you have other users)
    const userEmailsToDelete = [];
    for (let i = 1; i <= 35; i++) {
      userEmailsToDelete.push(`testuser${i}@example.com`);
    }
    try {
      const numDeleted = await queryInterface.bulkDelete('users', { email: { [Sequelize.Op.in]: userEmailsToDelete } }, {});
      console.log(`--- Seeder: Successfully deleted ${numDeleted} users.`); // <--- ADD DEBUG LOG
    } catch (error) {
      console.error("--- Seeder: Error during bulkDelete: ---", error);
      // For a simple clear: await queryInterface.bulkDelete('users', null, {});
      throw error;
    }
  }
};