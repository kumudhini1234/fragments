// src/server.js

// We want to gracefully shutdown our server
const stoppable = require('stoppable');

// Get our logger instance
const logger = require('./logger');

// Get our express app instance
const app = require('./app');

// Get the desired port from the process' environment. Default to 8080
// eslint-disable-next-line no-undef
const port = parseInt(process.env.PORT || '8080', 10);

// Log all environment variables if LOG_LEVEL is set to 'debug'
// eslint-disable-next-line no-undef
if (process.env.LOG_LEVEL === 'debug') {
  // console.log('Environment Variables:', process.env); // This will print all environment variables
}

// Start a server listening on this port
const server = stoppable(
  app.listen(port, '0.0.0.0', () => {
    logger.info(`Server started on port ${port}`);
    
  })
);

// Export our server instance so other parts of our code can access it if necessary.
module.exports = server;