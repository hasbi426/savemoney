// backend/src/app.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes'); // Main API router from routes/index.js
const errorHandler = require('./middleware/errorHandler');
const { AppSequelize } = require('./models'); // Use AppSequelize for runtime connection

const app = express();

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500'], // Add your frontend URL(s)
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Allow cookies if you use them for sessions
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));


// Middlewares
app.use(express.json()); // Parses incoming requests with JSON payloads
app.use(express.urlencoded({ extended: true })); // Parses incoming requests with URL-encoded payloads

// API Routes
app.use('/api', apiRoutes); // Mount all API routes under /api

// Simple health check route
app.get('/health', (req, res) => res.status(200).send('OK'));


// 404 Not Found Handler - for API routes
app.use('/api/*', (req, res, next) => {
  const error = new Error('Not Found - API endpoint does not exist');
  error.statusCode = 404;
  next(error);
});

// Global Error Handler (must be the last middleware)
app.use(errorHandler);

module.exports = app;