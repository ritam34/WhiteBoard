import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

class SocketService {
  constructor() {
    this.socket = null
    this.connected = false
  }

  connect(username, userId = null) {
    if (this.socket?.connected) {
      return this.socket
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        username,
        userId
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    })

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id)
      this.connected = true
    })

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      this.connected = false
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.connected = false
    }
  }

  createBoard(data) {
    this.socket?.emit('create-board', data)
  }

  joinBoard(boardId) {
    this.socket?.emit('join-board', { boardId })
  }

  leaveBoard() {
    this.socket?.emit('leave-board')
  }

  drawStart(data) {
    this.socket?.emit('draw-start', data)
  }

  drawMove(data) {
    this.socket?.emit('draw-move', data)
  }

  drawEnd(data) {
    this.socket?.emit('draw-end', data)
  }

  addObject(object) {
    this.socket?.emit('add-object', { object })
  }

  modifyObject(object) {
    this.socket?.emit('modify-object', { object })
  }

  deleteObject(objectId) {
    this.socket?.emit('delete-object', { objectId })
  }

  erase(objectId) {
    this.socket?.emit('erase', { objectId })
  }

  clearBoard() {
    this.socket?.emit('clear-board')
  }

  moveCursor(x, y) {
    this.socket?.emit('cursor-move', { x, y })
  }

  on(event, callback) {
    this.socket?.on(event, callback)
  }

  off(event, callback) {
    this.socket?.off(event, callback)
  }

  isConnected() {
    return this.connected && this.socket?.connected
  }

  getSocket() {
    return this.socket
  }
}

export default new SocketService()