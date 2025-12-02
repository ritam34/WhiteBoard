import { useState } from 'react'
import { 
  Pen, 
  Eraser, 
  Type, 
  Square, 
  Circle, 
  Minus,
  MousePointer2,
  Trash2,
  Download,
  Save,
  Users,
  Palette
} from 'lucide-react'
import ColorPicker from './ColorPicker'

const Toolbar = ({ 
  currentTool,
  onToolChange,
  strokeColor,
  onStrokeColorChange,
  fillColor,
  onFillColorChange,
  strokeWidth,
  onStrokeWidthChange,
  onClearBoard,
  onSaveBoard,
  onExportImage,
  userCount,
  users
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showUsers, setShowUsers] = useState(false)
  const [colorMode, setColorMode] = useState('stroke')

  const tools = [
    { id: 'select', icon: MousePointer2, label: 'Select', color: 'blue' },
    { id: 'pen', icon: Pen, label: 'Pen', color: 'primary' },
    { id: 'eraser', icon: Eraser, label: 'Eraser', color: 'red' },
    { id: 'text', icon: Type, label: 'Text', color: 'purple' },
    { id: 'rectangle', icon: Square, label: 'Rectangle', color: 'green' },
    { id: 'circle', icon: Circle, label: 'Circle', color: 'yellow' },
    { id: 'line', icon: Minus, label: 'Line', color: 'indigo' },
  ]

  const strokeWidths = [1, 2, 4, 6, 8, 12, 16, 20]

  const handleColorClick = (mode) => {
    setColorMode(mode)
    setShowColorPicker(true)
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-lg">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <Palette className="w-5 h-5 mr-2 text-primary-600" />
            Tools
          </h2>
          <button
            onClick={() => setShowUsers(!showUsers)}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <Users className="w-5 h-5 text-gray-600" />
            {userCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                {userCount}
              </span>
            )}
          </button>
        </div>

        {showUsers && users && users.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-xs font-medium text-gray-600 mb-2">Active Users</p>
            <div className="space-y-1">
              {users.map((user, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">{user.username || 'Anonymous'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-b border-gray-200">
        <p className="text-xs font-medium text-gray-600 mb-3">Drawing Tools</p>
        <div className="grid grid-cols-2 gap-2">
          {tools.map((tool) => {
            const Icon = tool.icon
            const isActive = currentTool === tool.id
            
            return (
              <button
                key={tool.id}
                onClick={() => onToolChange(tool.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-lg transition ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
                title={tool.label}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{tool.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="p-4 border-b border-gray-200">
        <p className="text-xs font-medium text-gray-600 mb-3">Colors</p>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Stroke</label>
            <button
              onClick={() => handleColorClick('stroke')}
              className="w-full h-12 rounded-lg border-2 border-gray-300 shadow-sm hover:border-primary-400 transition flex items-center justify-center"
              style={{ backgroundColor: strokeColor }}
            >
              {strokeColor === '#ffffff' && (
                <span className="text-gray-400 text-sm">White</span>
              )}
            </button>
          </div>

          <div>
            <label className="text-xs text-gray-600 mb-1 block">Fill</label>
            <button
              onClick={() => handleColorClick('fill')}
              className="w-full h-12 rounded-lg border-2 border-gray-300 shadow-sm hover:border-primary-400 transition flex items-center justify-center"
              style={{ 
                backgroundColor: fillColor === 'transparent' ? '#ffffff' : fillColor,
                backgroundImage: fillColor === 'transparent' 
                  ? 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)'
                  : 'none',
                backgroundSize: fillColor === 'transparent' ? '10px 10px' : 'auto',
                backgroundPosition: fillColor === 'transparent' ? '0 0, 5px 5px' : '0 0'
              }}
            >
              {fillColor === 'transparent' && (
                <span className="text-gray-600 text-sm font-medium">Transparent</span>
              )}
            </button>
          </div>
        </div>

        {showColorPicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">
                  Choose {colorMode === 'stroke' ? 'Stroke' : 'Fill'} Color
                </h3>
                <button
                  onClick={() => setShowColorPicker(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <ColorPicker
                color={colorMode === 'stroke' ? strokeColor : fillColor}
                onChange={(color) => {
                  if (colorMode === 'stroke') {
                    onStrokeColorChange(color)
                  } else {
                    onFillColorChange(color)
                  }
                }}
              />
              <button
                onClick={() => setShowColorPicker(false)}
                className="w-full mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-b border-gray-200">
        <p className="text-xs font-medium text-gray-600 mb-3">Stroke Width</p>
        <div className="space-y-2">
          <input
            type="range"
            min="1"
            max="20"
            value={strokeWidth}
            onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{strokeWidth}px</span>
            <div 
              className="rounded-full bg-gray-900"
              style={{ 
                width: `${strokeWidth * 2}px`, 
                height: `${strokeWidth * 2}px`,
                maxWidth: '40px',
                maxHeight: '40px'
              }}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-2 mt-3">
          {strokeWidths.map((width) => (
            <button
              key={width}
              onClick={() => onStrokeWidthChange(width)}
              className={`p-2 rounded-lg border-2 transition flex items-center justify-center ${
                strokeWidth === width
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div 
                className="rounded-full bg-gray-900"
                style={{ 
                  width: `${width * 1.5}px`, 
                  height: `${width * 1.5}px`,
                  maxWidth: '20px',
                  maxHeight: '20px'
                }}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-2 flex-1">
        <button
          onClick={onSaveBoard}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
        >
          <Save className="w-5 h-5" />
          <span>Save Board</span>
        </button>

        <button
          onClick={onExportImage}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
        >
          <Download className="w-5 h-5" />
          <span>Export Image</span>
        </button>

        <button
          onClick={onClearBoard}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
        >
          <Trash2 className="w-5 h-5" />
          <span>Clear Board</span>
        </button>
      </div>
    </div>
  )
}

export default Toolbar