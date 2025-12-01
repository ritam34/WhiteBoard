import api from './api'

export const register = async (username, email, password) => {
  const response = await api.post('/auth/register', {
    username,
    email,
    password
  })
  return response.data.data
}

export const login = async (email, password) => {
  const response = await api.post('/auth/login', {
    email,
    password
  })
  return response.data.data
}

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me')
  return response.data.data.user
}

export const updateProfile = async (data) => {
  const response = await api.put('/auth/profile', data)
  return response.data.data.user
}

export const changePassword = async (currentPassword, newPassword) => {
  const response = await api.put('/auth/change-password', {
    currentPassword,
    newPassword
  })
  return response.data
}