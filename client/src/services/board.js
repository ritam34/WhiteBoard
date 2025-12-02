import api from './api'

export const createBoard = async (title, isPublic = true) => {
  const response = await api.post('/boards', {
    title,
    isPublic
  })
  return response.data.data.board
}

export const getBoardById = async (boardId) => {
  const response = await api.get(`/boards/${boardId}`)
  return response.data.data.board
}
export const updateBoard = async (boardId, data) => {
  const response = await api.put(`/boards/${boardId}`, data)
  return response.data.data.board
}

export const saveBoardState = async (boardId, boardState) => {
  const response = await api.put(`/boards/${boardId}/state`, {
    boardState
  })
  return response.data
}
export const deleteBoard = async (boardId) => {
  const response = await api.delete(`/boards/${boardId}`)
  return response.data
}

export const getUserBoards = async () => {
  const response = await api.get('/boards/user/me')
  return response.data.data.boards
}

export const getPublicBoards = async (page = 1, limit = 20) => {
  const response = await api.get(`/boards/public?page=${page}&limit=${limit}`)
  return response.data.data
}

export const addCollaborator = async (boardId, userId) => {
  const response = await api.post(`/boards/${boardId}/collaborators`, {
    userId
  })
  return response.data.data.board
}

export const removeCollaborator = async (boardId, userId) => {
  const response = await api.delete(`/boards/${boardId}/collaborators/${userId}`)
  return response.data
}