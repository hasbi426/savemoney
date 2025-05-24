// backend/src/config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') }); // Adjusted path

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false, // Log SQL in dev
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    // Add dialectOptions for production SSL if needed
    // dialectOptions: process.env.NODE_ENV === 'production' ? {
    //   ssl: {
    //     require: true,
    //     rejectUnauthorized: false // Adjust as per your DB hosting requirements
    //   }
    // } : {}
  }
);

module.exports = sequelize;