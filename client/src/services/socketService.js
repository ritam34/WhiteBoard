import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.currentBoardId = null;
  }
  connect() {
    if (this.socket && this.connected) {
      return this.socket;
    }

    this.socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.connected = true;

      if (this.currentBoardId) {
        this.joinBoard(this.currentBoardId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`Socket reconnected after ${attemptNumber} attempts`);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.currentBoardId = null;
    }
  }

  createBoard(boardId, userName = null) {
    if (!this.socket) this.connect();
    
    this.currentBoardId = boardId;
    this.socket.emit('create-board', { boardId, userName });
  }

  joinBoard(boardId, userName = null) {
    if (!this.socket) this.connect();
    
    this.currentBoardId = boardId;
    this.socket.emit('join-board', { boardId, userName });
  }

  emitDrawStart(data) {
    if (this.socket && this.connected) {
      this.socket.emit('draw-start', data);
    }
  }

  emitDrawMove(data) {
    if (this.socket && this.connected) {
      this.socket.emit('draw-move', data);
    }
  }

  emitDrawEnd(data) {
    if (this.socket && this.connected) {
      this.socket.emit('draw-end', data);
    }
  }

  emitObjectAdded(object) {
    if (this.socket && this.connected) {
      this.socket.emit('object-added', { object });
    }
  }

  emitObjectModified(object) {
    if (this.socket && this.connected) {
      this.socket.emit('object-modified', { object });
    }
  }

  emitObjectRemoved(objectId) {
    if (this.socket && this.connected) {
      this.socket.emit('object-removed', { objectId });
    }
  }

  emitClearCanvas() {
    if (this.socket && this.connected) {
      this.socket.emit('clear-canvas');
    }
  }

  emitCursorMove(x, y, userName = null) {
    if (this.socket && this.connected) {
      this.socket.emit('cursor-move', { x, y, userName });
    }
  }

  onBoardCreated(callback) {
    if (this.socket) {
      this.socket.on('board-created', callback);
    }
  }

  onBoardJoined(callback) {
    if (this.socket) {
      this.socket.on('board-joined', callback);
    }
  }

  onUserJoined(callback) {
    if (this.socket) {
      this.socket.on('user-joined', callback);
    }
  }

  onUserLeft(callback) {
    if (this.socket) {
      this.socket.on('user-left', callback);
    }
  }

  onRemoteDrawStart(callback) {
    if (this.socket) {
      this.socket.on('remote-draw-start', callback);
    }
  }

  onRemoteDrawMove(callback) {
    if (this.socket) {
      this.socket.on('remote-draw-move', callback);
    }
  }

  onRemoteDrawEnd(callback) {
    if (this.socket) {
      this.socket.on('remote-draw-end', callback);
    }
  }

  onRemoteObjectAdded(callback) {
    if (this.socket) {
      this.socket.on('remote-object-added', callback);
    }
  }

  onRemoteObjectModified(callback) {
    if (this.socket) {
      this.socket.on('remote-object-modified', callback);
    }
  }

  onRemoteObjectRemoved(callback) {
    if (this.socket) {
      this.socket.on('remote-object-removed', callback);
    }
  }

  onRemoteClearCanvas(callback) {
    if (this.socket) {
      this.socket.on('remote-clear-canvas', callback);
    }
  }

  onRemoteCursorMove(callback) {
    if (this.socket) {
      this.socket.on('remote-cursor-move', callback);
    }
  }

  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  getSocket() {
    if (!this.socket) {
      return this.connect();
    }
    return this.socket;
  }

  isConnected() {
    return this.connected && this.socket && this.socket.connected;
  }

  getSocketId() {
    return this.socket ? this.socket.id : null;
  }

  getCurrentBoardId() {
    return this.currentBoardId;
  }
}

export default new SocketService();