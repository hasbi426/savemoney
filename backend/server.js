// backend/server.js
const http = require('http');
const app = require('./src/app'); // Your Express app
const { AppSequelize } = require('./src/models'); // Your Sequelize instance for the app

const PORT = process.env.PORT || 5001;
const server = http.createServer(app);

async function startServer() {
  try {
    // Test database connection
    await AppSequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync all models (useful for development, consider migrations for production)
    // Use { force: true } with caution as it drops tables
    // await AppSequelize.sync(); // Creates tables if they don't exist
    // console.log('All models were synchronized successfully.');

    server.listen(PORT, () => {
      console.log(`Backend server is running on http://localhost:${PORT}`);
      console.log(`API is available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Unable to connect to the database or start server:', error);
    process.exit(1); // Exit if DB connection fails
  }
}

startServer();