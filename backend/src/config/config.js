// backend/src/config/config.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') }); // Adjusted path

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: process.env.DB_DIALECT || 'postgres',
  },
  test: {
    // ... configuration for test environment
  },
  production: {
    // ... configuration for production environment
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: process.env.DB_DIALECT || 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Adjust as per your DB hosting requirements
      }
    }
  },
};