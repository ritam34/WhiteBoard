import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import * as authService from '../services/auth'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const navigate = useNavigate()

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token')
      
      if (storedToken) {
        try {
          const userData = await authService.getCurrentUser()
          setUser(userData)
          setToken(storedToken)
        } catch (error) {
          console.error('Auth init error:', error)
          localStorage.removeItem('token')
          setToken(null)
        }
      }
      
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password)
      
      localStorage.setItem('token', data.token)
      setToken(data.token)
      setUser(data.user)
      
      toast.success('Login successful!')
      navigate('/dashboard')
      
      return data
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      throw error
    }
  }

  const register = async (username, email, password) => {
    try {
      const data = await authService.register(username, email, password)
      
      localStorage.setItem('token', data.token)
      setToken(data.token)
      setUser(data.user)
      
      toast.success('Registration successful!')
      navigate('/dashboard')
      
      return data
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    toast.success('Logged out successfully')
    navigate('/')
  }

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}