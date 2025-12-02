import Board from '../models/Board.js';
import User from '../models/User.js';

class BoardService {
  async createSnapshot(boardId, boardState) {
    try {
      const board = await Board.findOne({ boardId });
      
      if (!board) {
        throw new Error('Board not found');
      }

      board.boardState = boardState;
      board.lastModified = new Date();
      await board.save();

      return {
        success: true,
        message: 'Snapshot created successfully',
        lastModified: board.lastModified
      };
    } catch (error) {
      console.error('Error creating snapshot:', error);
      throw error;
    }
  }

  async loadBoardState(boardId) {
    try {
      const board = await Board.findOne({ boardId });
      
      if (!board) {
        const newBoard = await Board.create({ boardId });
        return newBoard.boardState;
      }

      return board.boardState;
    } catch (error) {
      console.error('Error loading board state:', error);
      throw error;
    }
  }

  async checkAccess(boardId, userId) {
    try {
      const board = await Board.findOne({ boardId });
      
      if (!board) {
        return { hasAccess: false, reason: 'Board not found' };
      }

      if (board.isPublic) {
        return { hasAccess: true, board };
      }

      if (!userId) {
        return { hasAccess: false, reason: 'Authentication required' };
      }

      const isCreator = board.createdBy?.toString() === userId;
      const isCollaborator = board.collaborators.some(
        c => c.toString() === userId
      );

      if (isCreator || isCollaborator) {
        return { hasAccess: true, board };
      }

      return { hasAccess: false, reason: 'Access denied' };
    } catch (error) {
      console.error('Error checking access:', error);
      throw error;
    }
  }

  async getBoardMetadata(boardId) {
    try {
      const board = await Board.findOne({ boardId })
        .select('-boardState')
        .populate('createdBy', 'username email')
        .populate('collaborators', 'username email');

      return board;
    } catch (error) {
      console.error('Error getting board metadata:', error);
      throw error;
    }
  }

  async cleanupOldBoards(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await Board.deleteMany({
        lastModified: { $lt: cutoffDate },
        createdBy: null 
      });

      console.log(`Cleaned up ${result.deletedCount} old boards`);
      return result.deletedCount;
    } catch (error) {
      console.error('Error cleaning up old boards:', error);
      throw error;
    }
  }

  async duplicateBoard(boardId, userId, newTitle) {
    try {
      const originalBoard = await Board.findOne({ boardId });
      
      if (!originalBoard) {
        throw new Error('Original board not found');
      }

      const duplicatedBoard = await Board.create({
        title: newTitle || `${originalBoard.title} (Copy)`,
        createdBy: userId,
        collaborators: [userId],
        boardState: originalBoard.boardState,
        isPublic: originalBoard.isPublic
      });

      await User.findByIdAndUpdate(userId, {
        $push: { boards: duplicatedBoard._id }
      });

      return duplicatedBoard;
    } catch (error) {
      console.error('Error duplicating board:', error);
      throw error;
    }
  }

  async exportBoard(boardId) {
    try {
      const board = await Board.findOne({ boardId })
        .populate('createdBy', 'username')
        .lean();

      if (!board) {
        throw new Error('Board not found');
      }

      return {
        boardId: board.boardId,
        title: board.title,
        createdBy: board.createdBy?.username || 'Anonymous',
        createdAt: board.createdAt,
        boardState: board.boardState,
        exportedAt: new Date()
      };
    } catch (error) {
      console.error('Error exporting board:', error);
      throw error;
    }
  }

  async importBoard(boardData, userId) {
    try {
      const board = await Board.create({
        title: boardData.title || 'Imported Board',
        createdBy: userId,
        collaborators: [userId],
        boardState: boardData.boardState,
        isPublic: false 
      });

      await User.findByIdAndUpdate(userId, {
        $push: { boards: board._id }
      });

      return board;
    } catch (error) {
      console.error('Error importing board:', error);
      throw error;
    }
  }

  async getBoardActivity(boardId) {
    try {
      const board = await Board.findOne({ boardId });
      
      if (!board) {
        throw new Error('Board not found');
      }

      const objectCount = board.boardState?.objects?.length || 0;

      return {
        boardId: board.boardId,
        title: board.title,
        lastModified: board.lastModified,
        createdAt: board.createdAt,
        objectCount,
        collaboratorCount: board.collaborators.length,
        isPublic: board.isPublic
      };
    } catch (error) {
      console.error('Error getting board activity:', error);
      throw error;
    }
  }
}

export default new BoardService();