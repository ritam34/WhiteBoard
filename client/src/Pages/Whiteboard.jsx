import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { ArrowLeft, Wifi, WifiOff, Copy, Check } from 'lucide-react'

import Canvas from '../components/whiteboard/Canvas'
import Toolbar from '../components/whiteboard/Toolbar'
import UserCursors from '../components/whiteboard/UserCursors'
import Loading from '../components/common/Loading'

import socketService from '../services/socket'
import { getBoardById, saveBoardState } from '../services/board'

const Whiteboard = () => {
  const { boardId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const canvasRef = useRef(null)
  const fabricCanvasRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [board, setBoard] = useState(null)
  const [currentTool, setCurrentTool] = useState('pen')
  const [strokeColor, setStrokeColor] = useState('#000000')
  const [fillColor, setFillColor] = useState('transparent')
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [connected, setConnected] = useState(false)
  const [users, setUsers] = useState([])
  const [cursors, setCursors] = useState({})
  const [copied, setCopied] = useState(false)

  const autoSaveInterval = useRef(null)

  const socketRef = useRef(null)

  useEffect(() => {
    initializeBoard()

    return () => {
      cleanup()
    }
  }, [boardId])

  const initializeBoard = async () => {
    try {
      const boardData = await getBoardById(boardId)
      setBoard(boardData)

      const username = user?.username || `Guest_${Math.random().toString(36).substr(2, 9)}`
      const socket = socketService.connect(username, user?.id)
      socketRef.current = socket

      socket.on('connect', () => {
        console.log('Connected to whiteboard')
        setConnected(true)
        socket.emit('join-board', { boardId })
      })

      socket.on('disconnect', () => {
        console.log('Disconnected from whiteboard')
        setConnected(false)
      })

      socket.on('board-joined', (data) => {
        console.log('Joined board:', data)
        toast.success('Connected to whiteboard!')
        
        if (data.connectedUsers) {
          setUsers(data.connectedUsers)
        }
        if (data.boardState && fabricCanvasRef.current) {
          try {
            fabricCanvasRef.current.loadFromJSON(data.boardState, () => {
              fabricCanvasRef.current.renderAll()
            })
          } catch (err) {
            console.error('Error loading board state JSON:', err)
          }
        }
      })

      socket.on('user-joined', (data) => {
        console.log('User joined:', data.username)
        toast(`${data.username} joined`, { icon: '👋' })
        
        setUsers(prev => {
          const exists = prev.some(u => u.socketId === data.userId)
          return exists ? prev : [...prev, { username: data.username, socketId: data.userId }]
        })
      })

      socket.on('user-left', (data) => {
        console.log('User left:', data.username)
        toast(`${data.username} left`, { icon: '👋' })
        
        setUsers(prev => prev.filter(u => u.socketId !== data.userId))
        
        setCursors(prev => {
          const newCursors = { ...prev }
          delete newCursors[data.userId]
          return newCursors
        })
      })

      socket.on('remote-draw', (data) => {
        handleRemoteDrawing(data)
      })

      socket.on('remote-add', (data) => {
        handleRemoteAdd(data)
      })

      socket.on('remote-modify', (data) => {
        handleRemoteModify(data)
      })

      socket.on('remote-erase', (data) => {
        handleRemoteErase(data)
      })

      socket.on('board-cleared', () => {
        if (fabricCanvasRef.current) {
          fabricCanvasRef.current.clear()
          fabricCanvasRef.current.backgroundColor = '#ffffff'
          fabricCanvasRef.current.renderAll()
          toast.success('Board cleared')
        }
      })

      socket.on('cursor-update', (data) => {
        setCursors(prev => ({
          ...prev,
          [data.userId]: {
            x: data.x,
            y: data.y,
            username: data.username
          }
        }))
      })

      autoSaveInterval.current = setInterval(() => {
        handleSaveBoard(true)
      }, 30000)

      setLoading(false)

    } catch (error) {
      console.error('Error initializing board:', error)
      toast.error('Failed to load board')
      setLoading(false)
    }
  }

  const cleanup = () => {
    if (autoSaveInterval.current) {
      clearInterval(autoSaveInterval.current)
    }
    try {
      socketService.leaveBoard()
      socketService.disconnect()
    } catch (err) {
      console.warn('Error during socket cleanup:', err)
    }
  }

  const handleRemoteDrawing = (data) => {
    console.log('Remote draw event received:', data)
  }

  const handleRemoteAdd = (data) => {
    const canvas = fabricCanvasRef.current
    if (!canvas || !data.object) return

    try {
      const objData = data.object
      fabric.util.enlivenObjects([objData], (enlivened) => {
        if (enlivened && enlivened.length) {
          enlivened.forEach(o => {
            o.fromRemote = true
            o.selectable = false
            o.evented = false
            canvas.add(o)
          })
          canvas.renderAll()
        }
      })
    } catch (error) {
      console.error('Error adding remote object (fallback):', error)
      try {
        let obj
        const objDataType = data.object.type
        if (objDataType === 'path' && data.object.path) {
          obj = new window.fabric.Path(data.object.path, { ...data.object, fromRemote: true, selectable: false, evented: false })
        } else if (objDataType === 'rect') {
          obj = new window.fabric.Rect({ ...data.object, fromRemote: true, selectable: false, evented: false })
        } else if (objDataType === 'circle') {
          obj = new window.fabric.Circle({ ...data.object, fromRemote: true, selectable: false, evented: false })
        } else if (objDataType === 'line') {
          obj = new window.fabric.Line([data.object.x1, data.object.y1, data.object.x2, data.object.y2], { ...data.object, fromRemote: true, selectable: false, evented: false })
        } else if (objDataType === 'i-text' || objDataType === 'text') {
          obj = new window.fabric.IText(data.object.text || '', { ...data.object, fromRemote: true, selectable: false, evented: false })
        }

        if (obj) {
          canvas.add(obj)
          canvas.renderAll()
        }
      } catch (err2) {
        console.error('Error adding remote object second fallback:', err2)
      }
    }
  }

  const handleRemoteModify = (data) => {
    const canvas = fabricCanvasRef.current
    if (!canvas || !data.object) return

    const objId = data.object.id
    const obj = canvas.getObjects().find(o => o.id === objId)
    if (obj) {
      obj.set(data.object)
      obj.setCoords()
      canvas.renderAll()
    }
  }

  const handleRemoteErase = (data) => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return

    const obj = canvas.getObjects().find(o => o.id === data.objectId)
    if (obj) {
      canvas.remove(obj)
      canvas.renderAll()
    }
  }

  const handleDrawingEnd = (data) => {
    if (data && data.object) {
      socketService.addObject(data.object)
    }
  }

  const handleObjectAdded = (obj) => {
    if (obj && !obj.fromRemote) {
      const objData = obj.toObject(['id', 'type', 'left', 'top', 'width', 'height', 'radius', 'stroke', 'strokeWidth', 'fill', 'path', 'x1', 'y1', 'x2', 'y2', 'text', 'fontSize', 'fontFamily'])
      socketService.addObject(objData)
    }
  }

  const handleObjectModified = (obj) => {
    if (obj) {
      const objData = obj.toObject(['id', 'type', 'left', 'top', 'width', 'height', 'radius', 'stroke', 'strokeWidth', 'fill', 'path', 'x1', 'y1', 'x2', 'y2', 'text', 'fontSize', 'fontFamily'])
      socketService.modifyObject(objData)
    }
  }

  const handleObjectRemoved = (obj) => {
    if (obj && !obj.fromRemote) {
      socketService.deleteObject(obj.id)
    }
  }

  const handleClearBoard = () => {
    if (!confirm('Are you sure you want to clear the board?')) return

    const canvas = fabricCanvasRef.current
    if (canvas) {
      canvas.clear()
      canvas.backgroundColor = '#ffffff'
      canvas.renderAll()
      socketService.clearBoard()
      toast.success('Board cleared')
    }
  }

  const handleSaveBoard = async (auto = false) => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return

    try {
      const boardState = canvas.toJSON(['id'])
      await saveBoardState(boardId, boardState)
      
      if (!auto) {
        toast.success('Board saved!')
      }
    } catch (error) {
      console.error('Error saving board:', error)
      if (!auto) {
        toast.error('Failed to save board')
      }
    }
  }

  const handleExportImage = () => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return

    try {
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1
      })

      const link = document.createElement('a')
      link.download = `whiteboard-${boardId}-${Date.now()}.png`
      link.href = dataURL
      link.click()

      toast.success('Image exported!')
    } catch (error) {
      console.error('Error exporting image:', error)
      toast.error('Failed to export image')
    }
  }

  const handleCopyLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success('Link copied!')
    
    setTimeout(() => setCopied(false), 2000)
  }

  const handleMouseMove = (e) => {
    if (!connected) return
    
    const canvas = fabricCanvasRef.current
    if (!canvas) return

    const pointer = canvas.getPointer(e)
    
    if (!handleMouseMove.lastUpdate || Date.now() - handleMouseMove.lastUpdate > 50) {
      socketService.moveCursor(pointer.x, pointer.y)
      handleMouseMove.lastUpdate = Date.now()
    }
  }

  if (loading) {
    return <Loading fullScreen message="Loading whiteboard..." />
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {board?.title || 'Untitled Board'}
            </h1>
            <div className="flex items-center space-x-3 text-sm text-gray-500">
              <span className="flex items-center">
                {connected ? (
                  <>
                    <Wifi className="w-4 h-4 mr-1 text-green-600" />
                    Connected
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 mr-1 text-red-600" />
                    Disconnected
                  </>
                )}
              </span>
              <span>•</span>
              <span>{users.length} user{users.length !== 1 ? 's' : ''} online</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleCopyLink}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Share Link</span>
            </>
          )}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div 
          className="flex-1 relative"
          onMouseMove={handleMouseMove}
        >
          <Canvas
            canvasRef={canvasRef}
            fabricCanvasRef={fabricCanvasRef}
            currentTool={currentTool}
            strokeColor={strokeColor}
            strokeWidth={strokeWidth}
            fillColor={fillColor}
            onDrawingEnd={handleDrawingEnd}
            onObjectAdded={handleObjectAdded}
            onObjectModified={handleObjectModified}
            onObjectRemoved={handleObjectRemoved}
          />
          
          <UserCursors cursors={cursors} />
        </div>

        <Toolbar
          currentTool={currentTool}
          onToolChange={setCurrentTool}
          strokeColor={strokeColor}
          onStrokeColorChange={setStrokeColor}
          fillColor={fillColor}
          onFillColorChange={setFillColor}
          strokeWidth={strokeWidth}
          onStrokeWidthChange={setStrokeWidth}
          onClearBoard={handleClearBoard}
          onSaveBoard={() => handleSaveBoard(false)}
          onExportImage={handleExportImage}
          userCount={users.length}
          users={users}
        />
      </div>
    </div>
  )
}

export default Whiteboard
