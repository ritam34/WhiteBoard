import Board from '../models/Board.js';
import User from '../models/User.js';

export const createBoard = async (req, res, next) => {
  try {
    const { title, isPublic } = req.body;

    const boardData = {
      title: title || 'Untitled Board',
      isPublic: isPublic !== undefined ? isPublic : true
    };

    if (req.user) {
      boardData.createdBy = req.user.id;
      boardData.collaborators = [req.user.id];
    }

    const board = await Board.create(boardData);

    if (req.user) {
      await User.findByIdAndUpdate(req.user.id, {
        $push: { boards: board._id }
      });
    }

    res.status(201).json({
      status: 'success',
      message: 'Board created successfully',
      data: { board }
    });

  } catch (error) {
    next(error);
  }
};

export const getBoardById = async (req, res, next) => {
  try {
    const { boardId } = req.params;

    const board = await Board.findOne({ boardId })
      .populate('createdBy', 'username email')
      .populate('collaborators', 'username email');

    if (!board) {
      return res.status(404).json({
        status: 'error',
        message: 'Board not found'
      });
    }

    if (!board.isPublic && req.user) {
      const hasAccess = board.createdBy?.toString() === req.user.id ||
                       board.collaborators.some(c => c._id.toString() === req.user.id);
      
      if (!hasAccess) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied to this board'
        });
      }
    }

    res.status(200).json({
      status: 'success',
      data: { board }
    });

  } catch (error) {
    next(error);
  }
};

export const updateBoard = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const { title, boardState, isPublic } = req.body;

    const board = await Board.findOne({ boardId });

    if (!board) {
      return res.status(404).json({
        status: 'error',
        message: 'Board not found'
      });
    }

    if (req.user) {
      const hasAccess = board.createdBy?.toString() === req.user.id ||
                       board.collaborators.some(c => c.toString() === req.user.id);
      
      if (!hasAccess) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to update this board'
        });
      }
    }

    if (title) board.title = title;
    if (boardState) board.boardState = boardState;
    if (isPublic !== undefined) board.isPublic = isPublic;
    
    board.lastModified = new Date();

    await board.save();

    res.status(200).json({
      status: 'success',
      message: 'Board updated successfully',
      data: { board }
    });

  } catch (error) {
    next(error);
  }
};

export const saveBoardState = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const { boardState } = req.body;

    if (!boardState) {
      return res.status(400).json({
        status: 'error',
        message: 'Board state is required'
      });
    }

    const board = await Board.findOne({ boardId });

    if (!board) {
      return res.status(404).json({
        status: 'error',
        message: 'Board not found'
      });
    }

    board.boardState = boardState;
    board.lastModified = new Date();
    await board.save();

    res.status(200).json({
      status: 'success',
      message: 'Board state saved successfully',
      data: { 
        boardId: board.boardId,
        lastModified: board.lastModified 
      }
    });

  } catch (error) {
    next(error);
  }
};

export const deleteBoard = async (req, res, next) => {
  try {
    const { boardId } = req.params;

    const board = await Board.findOne({ boardId });

    if (!board) {
      return res.status(404).json({
        status: 'error',
        message: 'Board not found'
      });
    }

    if (!board.createdBy || board.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Only the board creator can delete this board'
      });
    }

    await board.deleteOne();

    await User.findByIdAndUpdate(req.user.id, {
      $pull: { boards: board._id }
    });

    res.status(200).json({
      status: 'success',
      message: 'Board deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

export const getUserBoards = async (req, res, next) => {
  try {
    const boards = await Board.find({ createdBy: req.user.id })
      .sort({ lastModified: -1 })
      .select('-boardState');

    res.status(200).json({
      status: 'success',
      results: boards.length,
      data: { boards }
    });

  } catch (error) {
    next(error);
  }
};

export const addCollaborator = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const { userId } = req.body;

    const board = await Board.findOne({ boardId });

    if (!board) {
      return res.status(404).json({
        status: 'error',
        message: 'Board not found'
      });
    }

    if (!board.createdBy || board.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Only the board creator can add collaborators'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    if (board.collaborators.includes(userId)) {
      return res.status(400).json({
        status: 'error',
        message: 'User is already a collaborator'
      });
    }

    board.collaborators.push(userId);
    await board.save();

    await User.findByIdAndUpdate(userId, {
      $push: { boards: board._id }
    });

    res.status(200).json({
      status: 'success',
      message: 'Collaborator added successfully',
      data: { board }
    });

  } catch (error) {
    next(error);
  }
};

export const removeCollaborator = async (req, res, next) => {
  try {
    const { boardId, userId } = req.params;

    const board = await Board.findOne({ boardId });

    if (!board) {
      return res.status(404).json({
        status: 'error',
        message: 'Board not found'
      });
    }

    if (!board.createdBy || board.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Only the board creator can remove collaborators'
      });
    }

    board.collaborators = board.collaborators.filter(
      id => id.toString() !== userId
    );
    await board.save();

    await User.findByIdAndUpdate(userId, {
      $pull: { boards: board._id }
    });

    res.status(200).json({
      status: 'success',
      message: 'Collaborator removed successfully'
    });

  } catch (error) {
    next(error);
  }
};

export const getPublicBoards = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const boards = await Board.find({ isPublic: true })
      .sort({ lastModified: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-boardState')
      .populate('createdBy', 'username');

    const count = await Board.countDocuments({ isPublic: true });

    res.status(200).json({
      status: 'success',
      results: boards.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
        total: count
      },
      data: { boards }
    });

  } catch (error) {
    next(error);
  }
};