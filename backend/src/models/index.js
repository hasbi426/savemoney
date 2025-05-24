// backend/src/models/index.js
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env]; // Path to your Sequelize CLI config
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

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
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes); // Standard Sequelize model definition
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize; // The Sequelize instance configured by CLI config
db.Sequelize = Sequelize; // The Sequelize library itself

// Use the application's Sequelize instance for runtime
// This ensures consistency if runtime config differs slightly from CLI (e.g. logging)
const appSequelize = require('../config/database'); // Your application's Sequelize instance
db.AppSequelize = appSequelize;
db.User = require('./user.model'); // Directly require and use the app's configured User model

module.exports = db;