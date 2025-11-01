import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import WhiteboardCanvas from '../components/WhiteboardCanvas';
import Toolbar from '../components/Toolbar';
import MobileToolbar from '../components/MobileToolbar.jsx';

function WhiteboardPage() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [activeTool, setActiveTool] = useState('pen');
  const [color, setColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);

  const handleCanvasReady = (canvas) => {
    canvasRef.current = canvas;
    console.log('Canvas ready:', canvas);
  };

  const handleToolChange = (tool) => {
    setActiveTool(tool);
    toast.info(`${tool.charAt(0).toUpperCase() + tool.slice(1)} tool selected`, {
      autoClose: 1000,
      position: 'bottom-right'
    });
  };

  const handleColorChange = (newColor) => {
    setColor(newColor);
  };

  const handleStrokeWidthChange = (width) => {
    setStrokeWidth(width);
  };

  const handleClearCanvas = () => {
    if (canvasRef.current) {
      if (window.confirm('Are you sure you want to clear the entire canvas?')) {
        canvasRef.current.clear();
        canvasRef.current.backgroundColor = '#ffffff';
        canvasRef.current.renderAll();
        toast.success('Canvas cleared', {
          autoClose: 2000
        });
      }
    }
  };

  const handleShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Board link copied to clipboard!', {
        autoClose: 2000
      });
    }).catch(() => {
      toast.error('Failed to copy link', {
        autoClose: 2000
      });
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200 z-40">
        <div className="max-w-full px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              ← Back
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-lg font-semibold text-gray-900">
              Board: <span className="text-blue-600">{boardId}</span>
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
              <span className="text-sm text-gray-600">Tool:</span>
              <span className="text-sm font-medium text-gray-900 capitalize">
                {activeTool}
              </span>
              <div 
                className="w-4 h-4 rounded-full border-2 border-white shadow"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm text-gray-600">{strokeWidth}px</span>
            </div>

            <button
              onClick={handleShareLink}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Share Link
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 relative overflow-hidden">
        <WhiteboardCanvas
          tool={activeTool}
          color={color}
          strokeWidth={strokeWidth}
          onCanvasReady={handleCanvasReady}
        />

        <Toolbar
          activeTool={activeTool}
          onToolChange={handleToolChange}
          color={color}
          onColorChange={handleColorChange}
          strokeWidth={strokeWidth}
          onStrokeWidthChange={handleStrokeWidthChange}
          onClearCanvas={handleClearCanvas}
        />

        <div className="fixed bottom-4 left-4 bg-white rounded-lg shadow-lg px-4 py-2 border border-gray-200 z-40">
          <p className="text-sm text-gray-600">
            {' '}Single-user drawing
          </p>
        </div>
      </div>
    </div>
  );
}

export default WhiteboardPage;