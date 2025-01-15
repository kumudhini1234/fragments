// src/server.js

// Import necessary modules 
const express = require('express');
const app = express();

// Add this condition to check LOG_LEVEL
if (process.env.LOG_LEVEL === 'debug') {
  console.log('Environment Variables:', process.env); // Print all environment variables
}

// Define a basic route for testing
app.get('/', (req, res) => {
  res.send('Server is running...');
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
