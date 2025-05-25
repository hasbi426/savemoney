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

// Store the CLI-configured instance for CLI operations if needed, though not directly used by app runtime usually
db.sequelizeCli = sequelizeCliInstance;
db.Sequelize = Sequelize; // The Sequelize library itself

// ---- Application's Sequelize Instance ----
const appSequelize = require('../config/database'); // Your application's runtime Sequelize instance
db.AppSequelize = appSequelize; // Make the app's instance available if needed directly

// Load all model files from this directory (except index.js and test files)
// and initialize them with the application's Sequelize instance (appSequelize)
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
    // Each model file exports a function: (sequelize, DataTypes) => { ... return Model; }
    const modelDefiner = require(path.join(__dirname, file));
    const model = modelDefiner(appSequelize, Sequelize.DataTypes); // Use app's sequelize instance
    db[model.name] = model; // e.g., db.User, db.Transaction
  });

// Apply associations if they exist
Object.keys(db).forEach(modelName => {
  if (db[modelName] && db[modelName].associate) {
    db[modelName].associate(db); // Pass the `db` object which contains all defined models
  }
});

module.exports = db;