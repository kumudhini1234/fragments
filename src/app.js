// src/app.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const passport = require('passport');

const authenticate = require('./auth');



const logger = require('./logger');
const pino = require('pino-http')({
  // Use our default logger instance, which is already configured
  logger,
});

// Import response functions
const { createErrorResponse } = require('./response');

// Create an express app instance we can use to attach middleware and HTTP routes
const app = express();

// Use pino logging middleware
app.use(pino);

// Use helmetjs security middleware
app.use(helmet());

const corsOptions = {
  origin: ['http://localhost:1234', 'http://ec2-54-172-39-176.compute-1.amazonaws.com:8080'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));



// Use gzip/deflate compression middleware
app.use(compression());

// Set up our passport authentication middleware
passport.use(authenticate.strategy());
app.use(passport.initialize());

// Define a simple health check route. If the server is running
// we'll respond with a 200 OK. If not, the server isn't healthy.
app.use('/', require('./routes'));

// Add 404 middleware to handle any requests for resources that can't be found
app.use((req, res) => {
  res.status(404).json(createErrorResponse(404, 'not found'));
});

// Add error-handling middleware to deal with anything else
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  // We may already have an error response we can use, but if not,
  // use a generic 500 server error and message.
  const status = err.status || 500;
  const message = err.message || 'unable to process request';

  // Log all errors for better debugging
  logger.error({ err, status }, `Error processing request`);

  res.status(status).json(createErrorResponse(status, message));
});

// Export our app so we can access it in server.js
module.exports = app;