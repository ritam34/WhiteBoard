export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

export const TOOLS = {
  PEN: 'pen',
  ERASER: 'eraser',
  TEXT: 'text',
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle',
  LINE: 'line',
  SELECT: 'select'
}

export const DEFAULT_SETTINGS = {
  strokeWidth: 2,
  strokeColor: '#000000',
  fillColor: 'transparent',
  fontSize: 16,
  fontFamily: 'Arial'
}

export const CANVAS_SETTINGS = {
  width: 1920,
  height: 1080,
  backgroundColor: '#ffffff'
}