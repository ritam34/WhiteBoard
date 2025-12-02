const ColorPicker = ({ color, onChange }) => {
  const presetColors = [
    '#000000', '#ffffff', '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
    '#f43f5e', '#64748b', '#6b7280', '#9ca3af', '#d1d5db', 'transparent'
  ]

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Custom Color
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={color === 'transparent' ? '#ffffff' : color}
            onChange={(e) => onChange(e.target.value)}
            className="w-16 h-16 rounded-lg border-2 border-gray-300 cursor-pointer"
          />
          <input
            type="text"
            value={color === 'transparent' ? 'transparent' : color}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="#000000"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preset Colors
        </label>
        <div className="grid grid-cols-6 gap-2">
          {presetColors.map((presetColor) => (
            <button
              key={presetColor}
              onClick={() => onChange(presetColor)}
              className={`w-10 h-10 rounded-lg border-2 transition ${
                color === presetColor
                  ? 'border-primary-600 scale-110 shadow-lg'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{
                backgroundColor: presetColor === 'transparent' ? '#ffffff' : presetColor,
                backgroundImage: presetColor === 'transparent'
                  ? 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)'
                  : 'none',
                backgroundSize: presetColor === 'transparent' ? '8px 8px' : 'auto',
                backgroundPosition: presetColor === 'transparent' ? '0 0, 4px 4px' : '0 0'
              }}
              title={presetColor === 'transparent' ? 'Transparent' : presetColor}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ColorPicker