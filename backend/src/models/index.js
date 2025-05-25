// backend/src/models/index.js
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env]; // For Sequelize CLI
const db = {};

let sequelizeCliInstance; // For CLI usage
if (config.use_env_variable) {
  sequelizeCliInstance = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelizeCliInstance = new Sequelize(config.database, config.username, config.password, config);
}

// Store the CLI-configured instance for CLI operations if needed
db.sequelizeCli = sequelizeCliInstance;
db.Sequelize = Sequelize; // The Sequelize library itself

// ---- Application's Sequelize Instance ----
const appSequelize = require('../config/database'); // Your application's runtime Sequelize instance
db.AppSequelize = appSequelize; // Make the app's instance available
db.sequelize = appSequelize; // Common practice to also name it 'sequelize'

// Load all model files from this directory
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const modelDefiner = require(path.join(__dirname, file));
    const model = modelDefiner(appSequelize, Sequelize.DataTypes); // Use app's sequelize instance
    db[model.name] = model; // e.g., db.User, db.Transaction
  });

// Apply associations
Object.keys(db).forEach(modelName => {
  if (db[modelName] && db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;