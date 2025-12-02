import { nanoid } from 'nanoid';
import Board from '../models/Board.js';

const activeBoardsMap = new Map();
const userSocketMap = new Map();

const AUTO_SAVE_INTERVAL = 5 * 60 * 1000;

class SocketService {
  handleConnection(socket, io) {
    userSocketMap.set(socket.id, {
      socketId: socket.id,
      currentBoard: null,
      username: socket.handshake.auth.username || `User_${socket.id.substring(0, 5)}`,
      userId: socket.handshake.auth.userId || null
    });

    console.log(`User connected: ${socket.id}`);

    socket.on('create-board', async (data = {}) => {
      try {
        const boardId = nanoid(10);
        
        socket.join(boardId);
        
        const boardData = {
          boardId,
          users: new Set([socket.id]),
          boardState: { version: '5.3.0', objects: [] },
          cursors: new Map(),
          lastSaved: Date.now(),
          autoSaveInterval: null
        };
        
        activeBoardsMap.set(boardId, boardData);

        const user = userSocketMap.get(socket.id);
        if (user) {
          user.currentBoard = boardId;
        }

        if (user?.userId) {
          await Board.create({
            boardId,
            title: data.title || 'Untitled Board',
            createdBy: user.userId,
            collaborators: [user.userId],
            isPublic: data.isPublic !== undefined ? data.isPublic : true
          });
        }

        this.setupAutoSave(boardId);

        console.log(`Board created: ${boardId} by ${socket.id}`);

        socket.emit('board-created', {
          boardId,
          boardState: { version: '5.3.0', objects: [] }
        });
      } catch (error) {
        console.error('Error creating board:', error);
        socket.emit('error', { message: 'Failed to create board' });
      }
    });

    socket.on('join-board', async ({ boardId }) => {
      try {
        if (!boardId) {
          socket.emit('error', { message: 'Board ID is required' });
          return;
        }

        socket.join(boardId);

        let board = activeBoardsMap.get(boardId);
        if (!board) {
          const dbBoard = await Board.findOne({ boardId });
          
          board = {
            boardId,
            users: new Set(),
            boardState: dbBoard?.boardState || { version: '5.3.0', objects: [] },
            cursors: new Map(),
            lastSaved: Date.now(),
            autoSaveInterval: null
          };
          
          activeBoardsMap.set(boardId, board);
          this.setupAutoSave(boardId);
        }

        board.users.add(socket.id);

        const user = userSocketMap.get(socket.id);
        if (user) {
          user.currentBoard = boardId;
        }

        console.log(`User ${socket.id} joined board: ${boardId}`);

        socket.emit('board-joined', {
          boardId,
          boardState: board.boardState,
          userCount: board.users.size,
          connectedUsers: Array.from(board.users).map(sid => {
            const u = userSocketMap.get(sid);
            return { socketId: sid, username: u?.username || 'Anonymous' };
          })
        });

        socket.to(boardId).emit('user-joined', {
          userId: socket.id,
          username: user?.username || 'Anonymous',
          userCount: board.users.size
        });
      } catch (error) {
        console.error('Error joining board:', error);
        socket.emit('error', { message: 'Failed to join board' });
      }
    });

    socket.on('draw-start', (data) => {
      const user = userSocketMap.get(socket.id);
      if (!user?.currentBoard) return;

      socket.to(user.currentBoard).emit('remote-draw', {
        type: 'draw-start',
        userId: socket.id,
        ...data
      });
    });

    socket.on('draw-move', (data) => {
      const user = userSocketMap.get(socket.id);
      if (!user?.currentBoard) return;

      socket.to(user.currentBoard).emit('remote-draw', {
        type: 'draw-move',
        userId: socket.id,
        ...data
      });
    });

    socket.on('draw-end', (data) => {
      const user = userSocketMap.get(socket.id);
      if (!user?.currentBoard) return;

      const board = activeBoardsMap.get(user.currentBoard);
      if (board && data.object) {
        if (!board.boardState.objects) {
          board.boardState.objects = [];
        }
        board.boardState.objects.push(data.object);
      }

      socket.to(user.currentBoard).emit('remote-draw', {
        type: 'draw-end',
        userId: socket.id,
        ...data
      });
    });

    socket.on('erase', (data) => {
      const user = userSocketMap.get(socket.id);
      if (!user?.currentBoard) return;

      const board = activeBoardsMap.get(user.currentBoard);
      if (board && data.objectId) {
        board.boardState.objects = board.boardState.objects.filter(
          obj => obj.id !== data.objectId
        );
      }

      socket.to(user.currentBoard).emit('remote-erase', {
        userId: socket.id,
        ...data
      });
    });

    socket.on('clear-board', () => {
      const user = userSocketMap.get(socket.id);
      if (!user?.currentBoard) return;

      const board = activeBoardsMap.get(user.currentBoard);
      if (board) {
        board.boardState.objects = [];
      }

      io.to(user.currentBoard).emit('board-cleared', {
        userId: socket.id
      });
    });

    socket.on('cursor-move', (data) => {
      const user = userSocketMap.get(socket.id);
      if (!user?.currentBoard) return;

      const board = activeBoardsMap.get(user.currentBoard);
      if (board) {
        board.cursors.set(socket.id, {
          x: data.x,
          y: data.y,
          username: user.username
        });
      }

      socket.to(user.currentBoard).emit('cursor-update', {
        userId: socket.id,
        username: user.username,
        x: data.x,
        y: data.y
      });
    });

    socket.on('modify-object', (data) => {
      const user = userSocketMap.get(socket.id);
      if (!user?.currentBoard) return;

      const board = activeBoardsMap.get(user.currentBoard);
      if (board && data.object) {
        const index = board.boardState.objects.findIndex(obj => obj.id === data.object.id);
        if (index !== -1) {
          board.boardState.objects[index] = data.object;
        }
      }

      socket.to(user.currentBoard).emit('remote-modify', {
        userId: socket.id,
        ...data
      });
    });

    socket.on('add-object', (data) => {
      const user = userSocketMap.get(socket.id);
      if (!user?.currentBoard) return;

      const board = activeBoardsMap.get(user.currentBoard);
      if (board && data.object) {
        board.boardState.objects.push(data.object);
      }

      socket.to(user.currentBoard).emit('remote-add', {
        userId: socket.id,
        ...data
      });
    });

    socket.on('leave-board', () => {
      this.handleDisconnection(socket, io);
    });
  }

  handleDisconnection(socket, io) {
    const user = userSocketMap.get(socket.id);
    
    if (user?.currentBoard) {
      const board = activeBoardsMap.get(user.currentBoard);
      
      if (board) {
        board.users.delete(socket.id);
        board.cursors.delete(socket.id);

        socket.to(user.currentBoard).emit('user-left', {
          userId: socket.id,
          username: user.username,
          userCount: board.users.size
        });

        if (board.users.size === 0) {
          if (board.autoSaveInterval) {
            clearInterval(board.autoSaveInterval);
          }
          activeBoardsMap.delete(user.currentBoard);
          console.log(`Board ${user.currentBoard} removed (no users)`);
        }
      }
    }

    userSocketMap.delete(socket.id);
  }

  setupAutoSave(boardId) {
    const board = activeBoardsMap.get(boardId);
    if (!board || board.autoSaveInterval) return;

    board.autoSaveInterval = setInterval(async () => {
      try {
        await this.saveBoardToDatabase(boardId);
      } catch (error) {
        console.error(`Auto-save failed for board ${boardId}:`, error);
      }
    }, AUTO_SAVE_INTERVAL);

    console.log(`Auto-save enabled for board: ${boardId}`);
  }

  async saveBoardToDatabase(boardId) {
    const board = activeBoardsMap.get(boardId);
    if (!board) return;

    try {
      const dbBoard = await Board.findOne({ boardId });
      if (dbBoard) {
        dbBoard.boardState = board.boardState;
        dbBoard.lastModified = new Date();
        await dbBoard.save();
        board.lastSaved = Date.now();
        console.log(`Board ${boardId} auto-saved successfully`);
      }
    } catch (error) {
      if (error.message !== 'Board not found') {
        throw error;
      }
    }
  }

  getActiveStats() {
    return {
      activeBoards: activeBoardsMap.size,
      connectedUsers: userSocketMap.size,
      boards: Array.from(activeBoardsMap.entries()).map(([boardId, board]) => ({
        boardId,
        userCount: board.users.size,
        objectCount: board.boardState?.objects?.length || 0
      }))
    };
  }
}

export default new SocketService();