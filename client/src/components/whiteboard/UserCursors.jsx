import { MousePointer2 } from 'lucide-react'

const UserCursors = ({ cursors }) => {
  const getUserColor = (userId) => {
    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
      '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
      '#a855f7', '#ec4899'
    ]
    
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash)
    }
    
    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {Object.entries(cursors).map(([userId, cursor]) => (
        <div
          key={userId}
          className="absolute transition-all duration-100 ease-linear"
          style={{
            left: `${cursor.x}px`,
            top: `${cursor.y}px`,
            transform: 'translate(-2px, -2px)'
          }}
        >
          <MousePointer2
            className="w-6 h-6 drop-shadow-lg"
            style={{ color: getUserColor(userId) }}
            strokeWidth={2.5}
          />
          
          <div
            className="absolute top-6 left-2 px-2 py-1 rounded-md text-white text-xs font-medium whitespace-nowrap shadow-lg"
            style={{ backgroundColor: getUserColor(userId) }}
          >
            {cursor.username || 'Anonymous'}
          </div>
        </div>
      ))}
    </div>
  )
}

export default UserCursors