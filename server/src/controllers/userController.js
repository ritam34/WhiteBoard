import User from '../models/User.js';
import Board from '../models/Board.js';

export const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('-password')
      .populate('boards', 'boardId title lastModified');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { user }
    });

  } catch (error) {
    next(error);
  }
};

export const searchUsers = async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query must be at least 2 characters'
      });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    })
    .select('username email avatar createdAt')
    .limit(10);

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: { users }
    });

  } catch (error) {
    next(error);
  }
};

export const getUserStats = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (req.user.id !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only view your own statistics'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const boardsCreated = await Board.countDocuments({ createdBy: userId });
    const boardsCollaborated = await Board.countDocuments({
      collaborators: userId,
      createdBy: { $ne: userId }
    });

    const recentBoards = await Board.find({ createdBy: userId })
      .sort({ lastModified: -1 })
      .limit(5)
      .select('boardId title lastModified');

    const stats = {
      totalBoardsCreated: boardsCreated,
      totalBoardsCollaborated: boardsCollaborated,
      totalBoards: boardsCreated + boardsCollaborated,
      recentBoards,
      memberSince: user.createdAt
    };

    res.status(200).json({
      status: 'success',
      data: { stats }
    });

  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (req.user.id !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only delete your own account'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    await Board.deleteMany({ createdBy: userId });

    await Board.updateMany(
      { collaborators: userId },
      { $pull: { collaborators: userId } }
    );

    await user.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Account deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};