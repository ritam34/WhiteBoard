import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/common/Navbar'
import Loading from '../components/common/Loading'
import { Plus, Palette, Clock, Trash2, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import { createBoard, getUserBoards, deleteBoard } from '../services/board'

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [boards, setBoards] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadBoards()
  }, [])

  const loadBoards = async () => {
    try {
      const data = await getUserBoards()
      setBoards(data)
    } catch (error) {
      toast.error('Failed to load boards')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBoard = async () => {
    const title = prompt('Board title:')
    if (!title) return

    setCreating(true)
    try {
      const board = await createBoard(title, true)
      toast.success('Board created!')
      navigate(`/board/${board.boardId}`)
    } catch (error) {
      toast.error('Failed to create board')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteBoard = async (boardId, e) => {
    e.stopPropagation()
    
    if (!confirm('Are you sure you want to delete this board?')) return

    try {
      await deleteBoard(boardId)
      setBoards(boards.filter(b => b.boardId !== boardId))
      toast.success('Board deleted')
    } catch (error) {
      toast.error('Failed to delete board')
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <Loading message="Loading your boards..." />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your whiteboards and start collaborating
          </p>
        </div>

        <button
          onClick={handleCreateBoard}
          disabled={creating}
          className="mb-8 inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition shadow-lg hover:shadow-xl disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
          <span>{creating ? 'Creating...' : 'Create New Board'}</span>
        </button>

        {boards.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-300">
            <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No boards yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first board to get started
            </p>
            <button
              onClick={handleCreateBoard}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              <Plus className="w-5 h-5" />
              <span>Create Board</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <div
                key={board._id}
                onClick={() => navigate(`/board/${board.boardId}`)}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer border border-gray-200 overflow-hidden group"
              >
                <div className="h-48 bg-gradient-to-br from-primary-50 to-purple-50 flex items-center justify-center relative">
                  <Palette className="w-16 h-16 text-primary-300" />
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                    {board.title}
                  </h3>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>Modified {formatDate(board.lastModified)}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/board/${board.boardId}`)
                      }}
                      className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Open</span>
                    </button>
                    
                    <button
                      onClick={(e) => handleDeleteBoard(board.boardId, e)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete board"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {boards.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {boards.length}
              </div>
              <div className="text-gray-600">Total Boards</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {boards.filter(b => b.isPublic).length}
              </div>
              <div className="text-gray-600">Public Boards</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {boards.filter(b => !b.isPublic).length}
              </div>
              <div className="text-gray-600">Private Boards</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard