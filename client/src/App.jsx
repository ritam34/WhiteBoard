import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Whiteboard from './pages/Whiteboard'
import Dashboard from './pages/Dashboard'
import Login from './components/auth/Login'
import Register from './components/auth/Register'

import ProtectedRoute from './components/auth/ProtectedRoute'
import Loading from './components/common/Loading'

function App() {
  const { loading } = useAuth()

  if (loading) {
    return <Loading fullScreen />
  }

  return (
    <Routes>

      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      
      <Route path="/board/:boardId" element={<Whiteboard />} />
      
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}

export default App