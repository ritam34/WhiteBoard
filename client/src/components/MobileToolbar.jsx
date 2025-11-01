import { useState } from 'react';
import { 
  FaPen, 
  FaEraser, 
  FaTrash, 
  FaPalette,
  FaBars,
  FaTimes
} from 'react-icons/fa';

function MobileToolbar({ 
  activeTool, 
  onToolChange, 
  color, 
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  onClearCanvas 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', 
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'
  ];

  const tools = [
    { id: 'pen', icon: FaPen, label: 'Pen' },
    { id: 'eraser', icon: FaEraser, label: 'Eraser' },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-4 rounded-full shadow-lg md:hidden"
      >
        {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-4 bg-white rounded-lg shadow-xl p-4 z-50 md:hidden border border-gray-200">
          <div className="grid grid-cols-2 gap-2 mb-3">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => {
                    onToolChange(tool.id);
                    setIsOpen(false);
                  }}
                  className={`p-3 rounded-lg transition-all ${
                    activeTool === tool.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <Icon size={20} className="mx-auto" />
                  <span className="text-xs mt-1 block">{tool.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mb-3">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-full p-2 rounded-lg bg-gray-100 flex items-center justify-between"
            >
              <span className="text-sm text-gray-700">Color</span>
              <div 
                className="w-6 h-6 rounded border-2 border-white shadow"
                style={{ backgroundColor: color }}
              />
            </button>

            {showColorPicker && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      onColorChange(c);
                      setShowColorPicker(false);
                    }}
                    className={`w-full h-10 rounded border-2 ${
                      color === c ? 'border-blue-600' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="mb-3">
            <label className="text-sm text-gray-700 block mb-1">
              Width: {strokeWidth}px
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={strokeWidth}
              onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <button
            onClick={() => {
              onClearCanvas();
              setIsOpen(false);
            }}
            className="w-full p-3 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all flex items-center justify-center space-x-2"
          >
            <FaTrash size={16} />
            <span className="text-sm font-medium">Clear Canvas</span>
          </button>
        </div>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

export default MobileToolbar;