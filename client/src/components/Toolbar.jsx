import { useState } from 'react';
import { 
  FaPen, 
  FaEraser, 
  FaTrash, 
  FaPalette
} from 'react-icons/fa';
import { FaSlidersH } from "react-icons/fa"; 


function Toolbar({ 
  activeTool, 
  onToolChange, 
  color, 
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  onClearCanvas 
}) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showStrokePicker, setShowStrokePicker] = useState(false);

  const colors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', 
    '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#FFA500', '#800080', '#FFC0CB', '#A52A2A'
  ];

  const strokeWidths = [1, 2, 4, 6, 8, 12, 16, 20];

  const tools = [
    { id: 'pen', icon: FaPen, label: 'Pen' },
    { id: 'eraser', icon: FaEraser, label: 'Eraser' },
  ];

  return (
    <div className="fixed left-4 top-24 bg-white rounded-lg shadow-lg p-3 z-50 border border-gray-200">
      <div className="flex flex-col space-y-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => onToolChange(tool.id)}
              className={`p-3 rounded-lg transition-all duration-200 ${
                activeTool === tool.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={tool.label}
            >
              <Icon size={20} />
            </button>
          );
        })}

        <div className="border-t border-gray-300 my-2"></div>

        <div className="relative">
          <button
            onClick={() => {
              setShowColorPicker(!showColorPicker);
              setShowStrokePicker(false);
            }}
            className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all duration-200 relative"
            title="Color"
          >
            <FaPalette size={20} className="text-gray-700" />
            <div 
              className="absolute bottom-1 right-1 w-3 h-3 rounded-full border border-white"
              style={{ backgroundColor: color }}
            ></div>
          </button>

          {showColorPicker && (
            <div className="absolute left-full ml-2 top-0 bg-white rounded-lg shadow-lg p-3 border border-gray-200">
              <div className="grid grid-cols-4 gap-2 w-40">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      onColorChange(c);
                      setShowColorPicker(false);
                    }}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${
                      color === c ? 'border-blue-600 scale-110' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => onColorChange(e.target.value)}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setShowStrokePicker(!showStrokePicker);
              setShowColorPicker(false);
            }}
            className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all duration-200"
            title="Stroke Width"
          >
            < FaSlidersH size={20} className="text-gray-700" />
          </button>

          {showStrokePicker && (
            <div className="absolute left-full ml-2 top-0 bg-white rounded-lg shadow-lg p-3 border border-gray-200">
              <div className="flex flex-col space-y-2 w-32">
                {strokeWidths.map((width) => (
                  <button
                    key={width}
                    onClick={() => {
                      onStrokeWidthChange(width);
                      setShowStrokePicker(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded transition-all ${
                      strokeWidth === width
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <span className="text-sm font-medium">{width}px</span>
                    <div 
                      className="rounded-full bg-current"
                      style={{ 
                        width: `${Math.min(width, 12)}px`, 
                        height: `${Math.min(width, 12)}px` 
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-300 my-2"></div>

        <button
          onClick={onClearCanvas}
          className="p-3 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-200"
          title="Clear Canvas"
        >
          <FaTrash size={20} />
        </button>
      </div>

      {(showColorPicker || showStrokePicker) && (
        <div 
          className="fixed inset-0 z-[-1]" 
          onClick={() => {
            setShowColorPicker(false);
            setShowStrokePicker(false);
          }}
        />
      )}
    </div>
  );
}

export default Toolbar;