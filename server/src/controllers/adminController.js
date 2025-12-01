import Board from '../models/boardModel.js';
import User from '../models/userModel.js';
import socketService from '../services/socketService.js';

/**
 * @desc    Get application statistics
 * @route   GET /api/admin/stats
 * @access  Public (in production, make this protected)
 */
const getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBoards = await Board.countDocuments();
    const publicBoards = await Board.countDocuments({ isPublic: true });
    const privateBoards = await Board.countDocuments({ isPublic: false });

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username email createdAt');

    const recentBoards = await Board.find()
      .sort({ lastModified: -1 })
      .limit(5)
      .select('boardId title lastModified createdBy')
      .populate('createdBy', 'username');

    const socketStats = socketService.getActiveStats();

    const boardsWithSizes = await Board.aggregate([
      {
        $project: {
          objectCount: { $size: { $ifNull: ['$boardState.objects', []] } }
        }
      },
      {
        $group: {
          _id: null,
          avgObjects: { $avg: '$objectCount' },
          maxObjects: { $max: '$objectCount' },
          minObjects: { $min: '$objectCount' }
        }
      }
    ]);

    const stats = {
      database: {
        totalUsers,
        totalBoards,
        publicBoards,
        privateBoards,
        boardStats: boardsWithSizes[0] || { avgObjects: 0, maxObjects: 0, minObjects: 0 }
      },
      realTime: {
        activeBoards: socketStats.activeBoards,
        connectedUsers: socketStats.connectedUsers,
        boards: socketStats.boards
      },
      recent: {
        users: recentUsers,
        boards: recentBoards
      },
      server: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV
      }
    };

    res.status(200).json({
      status: 'success',
      data: stats
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get health check
 * @route   GET /api/admin/health
 * @access  Public
 */
const healthCheck = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const dbState = mongoose.connection.readyState;
    
    const dbStatus = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    const health = {
      status: dbState === 1 ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: dbStatus[dbState],
        connected: dbState === 1
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB'
      }
    };

    const statusCode = health.status === 'healthy' ? 200 : 503;

    res.status(statusCode).json({
      status: health.status,
      data: health
    });

  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message
    });
  }
};

export { getStats, healthCheck };