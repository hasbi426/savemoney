// backend/src/app.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
// const { AppSequelize } = require('./models'); // Not directly needed here anymore

const app = express();

// CORS configuration - more permissive for local development
const allowedOrigins = [
    'http://localhost:3000', // Example: React dev server
    'http://localhost:5500', // Common Live Server port
    'http://127.0.0.1:5500', // Common Live Server port
    'http://localhost:5501', // Another common Live Server port
    'http://127.0.0.1:5501',
    // Add your frontend's actual origin if it's different,
    // or if you are opening file:/// directly (though this can be tricky with CORS)
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests, or file://)
    // OR if origin is in allowedOrigins
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', apiRoutes);

// Simple health check route
app.get('/health', (req, res) => res.status(200).send('OK'));

// Global Error Handler (must be the last middleware using `app.use`)
app.use(errorHandler);

module.exports = app;