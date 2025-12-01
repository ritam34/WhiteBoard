import { Loader2 } from 'lucide-react'

const Loading = ({ fullScreen = false, message = 'Loading...' }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
          <p className="text-gray-700 font-medium">{message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center space-y-3">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  )
}

export default Loading