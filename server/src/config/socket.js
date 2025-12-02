import { Server } from 'socket.io';
import socketService from '../services/socketService.js';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    next();
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socketService.handleConnection(socket, io);

    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${socket.id} (${reason})`);
      socketService.handleDisconnection(socket, io);
    });
  });

  console.log('Socket.IO initialized');
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};