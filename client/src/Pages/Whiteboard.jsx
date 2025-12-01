import { useParams } from 'react-router-dom'
import { Palette } from 'lucide-react'

const Whiteboard = () => {
  const { boardId } = useParams()

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Palette className="w-16 h-16 text-primary-600 mx-auto" />
        <h1 className="text-2xl font-bold text-gray-900">Whiteboard</h1>
        <p className="text-gray-600">Board ID: {boardId}</p>
        <p className="text-sm text-gray-500">
          🚧 Whiteboard component coming soon!
        </p>
      </div>
    </div>
  )
}

export default Whiteboard