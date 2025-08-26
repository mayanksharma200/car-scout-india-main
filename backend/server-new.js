// Main server file - Entry point for the organized backend
// This file serves as a bridge between the old structure and new organized structure

// Use the new organized server
const { startServer } = require('./src/server');

// Start the server
startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});