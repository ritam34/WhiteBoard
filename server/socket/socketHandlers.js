const activeBoards = new Map();
const userBoards = new Map(); 

export const initializeSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('create-board', ({ boardId, userName }) => {
      console.log(`Creating board: ${boardId} by ${userName || socket.id}`);
      
      if (!activeBoards.has(boardId)) {
        activeBoards.set(boardId, {
          boardId,
          users: new Map(),
          boardState: { version: '5.3.0', objects: [] },
          createdAt: new Date()
        });
      }

      socket.join(boardId);
      userBoards.set(socket.id, boardId);

      const board = activeBoards.get(boardId);
      board.users.set(socket.id, {
        socketId: socket.id,
        userName: userName || `User-${socket.id.slice(0, 4)}`,
        joinedAt: new Date()
      });

      socket.emit('board-created', {
        boardId,
        boardState: board.boardState,
        users: Array.from(board.users.values())
      });

      console.log(`Board created: ${boardId}, Users: ${board.users.size}`);
    });

    socket.on('join-board', ({ boardId, userName }) => {
      console.log(`User joining board: ${boardId} (${userName || socket.id})`);

      if (!activeBoards.has(boardId)) {
        activeBoards.set(boardId, {
          boardId,
          users: new Map(),
          boardState: { version: '5.3.0', objects: [] },
          createdAt: new Date()
        });
      }

      socket.join(boardId);
      userBoards.set(socket.id, boardId);

      const board = activeBoards.get(boardId);

      board.users.set(socket.id, {
        socketId: socket.id,
        userName: userName || `User-${socket.id.slice(0, 4)}`,
        joinedAt: new Date()
      });

      socket.emit('board-joined', {
        boardId,
        boardState: board.boardState,
        users: Array.from(board.users.values())
      });

      socket.to(boardId).emit('user-joined', {
        user: {
          socketId: socket.id,
          userName: userName || `User-${socket.id.slice(0, 4)}`
        },
        totalUsers: board.users.size
      });

      console.log(`User joined board: ${boardId}, Total users: ${board.users.size}`);
    });

    socket.on('draw-start', (data) => {
      const boardId = userBoards.get(socket.id);
      if (!boardId) return;

      socket.to(boardId).emit('remote-draw-start', {
        ...data,
        userId: socket.id
      });
    });

    socket.on('draw-move', (data) => {
      const boardId = userBoards.get(socket.id);
      if (!boardId) return;

      socket.to(boardId).emit('remote-draw-move', {
        ...data,
        userId: socket.id
      });
    });

    socket.on('draw-end', (data) => {
      const boardId = userBoards.get(socket.id);
      if (!boardId) return;

      const board = activeBoards.get(boardId);
      if (board && data.object) {
        board.boardState.objects.push(data.object);
      }

      socket.to(boardId).emit('remote-draw-end', {
        ...data,
        userId: socket.id
      });
    });

    socket.on('object-added', (data) => {
      const boardId = userBoards.get(socket.id);
      if (!boardId) return;

      const board = activeBoards.get(boardId);
      if (board && data.object) {
        board.boardState.objects.push(data.object);
      }

      socket.to(boardId).emit('remote-object-added', {
        ...data,
        userId: socket.id
      });
    });

    socket.on('object-modified', (data) => {
      const boardId = userBoards.get(socket.id);
      if (!boardId) return;

      socket.to(boardId).emit('remote-object-modified', {
        ...data,
        userId: socket.id
      });
    });

    socket.on('object-removed', (data) => {
      const boardId = userBoards.get(socket.id);
      if (!boardId) return;

      const board = activeBoards.get(boardId);
      if (board) {
        board.boardState.objects = board.boardState.objects.filter(
          obj => obj.id !== data.objectId
        );
      }

      socket.to(boardId).emit('remote-object-removed', {
        ...data,
        userId: socket.id
      });
    });

    socket.on('clear-canvas', () => {
      const boardId = userBoards.get(socket.id);
      if (!boardId) return;

      const board = activeBoards.get(boardId);
      if (board) {
        board.boardState.objects = [];
      }

      socket.to(boardId).emit('remote-clear-canvas', {
        userId: socket.id
      });

      console.log(`Canvas cleared in board: ${boardId}`);
    });

    socket.on('cursor-move', (data) => {
      const boardId = userBoards.get(socket.id);
      if (!boardId) return;

      socket.to(boardId).emit('remote-cursor-move', {
        ...data,
        userId: socket.id
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);

      const boardId = userBoards.get(socket.id);
      if (boardId) {
        const board = activeBoards.get(boardId);
        if (board) {
          board.users.delete(socket.id);

          socket.to(boardId).emit('user-left', {
            userId: socket.id,
            totalUsers: board.users.size
          });

          console.log(`User left board: ${boardId}, Remaining: ${board.users.size}`);

          if (board.users.size === 0) {
            activeBoards.delete(boardId);
            console.log(`Deleted empty board: ${boardId}`);
          }
        }

        userBoards.delete(socket.id);
      }
    });
  });

  console.log('Socket handlers initialized');
};

export const getActiveBoards = () => {
  return Array.from(activeBoards.entries()).map(([boardId, board]) => ({
    boardId,
    userCount: board.users.size,
    objectCount: board.boardState.objects.length,
    createdAt: board.createdAt
  }));
};