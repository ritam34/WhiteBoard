import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './src/app.js';
import connectDB from './src/config/database.js';
import { initializeSocket } from './src/config/socket.js';

const PORT = process.env.PORT || 5000;

connectDB();

const server = http.createServer(app);

initializeSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Socket.IO ready for connections`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});