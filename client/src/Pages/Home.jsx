import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/common/Navbar'
import { Palette, Users, Zap, Shield, ArrowRight, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { createBoard } from '../services/board'

const Home = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [creating, setCreating] = useState(false)

  const handleCreateBoard = async () => {
    setCreating(true)
    try {
      const board = await createBoard('Untitled Board', true)
      toast.success('Board created!')
      navigate(`/board/${board.boardId}`)
    } catch (error) {
      toast.error('Failed to create board')
    } finally {
      setCreating(false)
    }
  }

  const handleJoinBoard = () => {
    const boardId = prompt('Enter Board ID:')
    if (boardId) {
      navigate(`/board/${boardId}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>Real-time Collaboration</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
            Collaborate on a
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">
              Shared Whiteboard
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Draw, sketch, and brainstorm together in real-time. Perfect for remote teams, 
            classrooms, and creative collaboration.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <button
              onClick={handleCreateBoard}
              disabled={creating}
              className="group relative px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold text-lg hover:bg-primary-700 transition-all hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center space-x-2">
                <Palette className="w-5 h-5" />
                <span>{creating ? 'Creating...' : 'Create New Board'}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>

            <button
              onClick={handleJoinBoard}
              className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold text-lg hover:bg-gray-50 transition border-2 border-gray-200 hover:border-primary-300"
            >
              Join Existing Board
            </button>
          </div>

          {!isAuthenticated && (
            <p className="text-sm text-gray-500">
              No account needed! Or{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-primary-600 font-medium hover:underline"
              >
                sign up
              </button>
              {' '}to save your boards
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition border border-gray-100">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Real-time Collaboration
            </h3>
            <p className="text-gray-600">
              See changes instantly as multiple users draw together. Live cursors show where everyone is working.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Instant Setup
            </h3>
            <p className="text-gray-600">
              Start drawing in seconds. No installation required, just share a link and collaborate.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Secure & Private
            </h3>
            <p className="text-gray-600">
              Your boards are secure. Create private boards or share public ones for everyone to see.
            </p>
          </div>
        </div>

        <div className="mt-24 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-purple-600 rounded-3xl blur-3xl opacity-20"></div>
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
            <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center">
              <div className="text-center space-y-4">
                <Palette className="w-16 h-16 text-primary-600 mx-auto" />
                <p className="text-gray-600 text-lg">
                  Click "Create New Board" to start drawing
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white border-t border-gray-200 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>© 2024 Collaborative Whiteboard. Built with</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home