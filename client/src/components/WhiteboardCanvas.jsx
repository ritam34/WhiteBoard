import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';

function WhiteboardCanvas({ 
  tool = 'pen',
  color = '#000000',
  strokeWidth = 2,
  onCanvasReady 
}) {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight - 73,
      backgroundColor: '#ffffff',
      isDrawingMode: false,
      selection: false,
    });

    fabricCanvasRef.current = canvas;

    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.color = color;
    canvas.freeDrawingBrush.width = strokeWidth;

    if (onCanvasReady) {
      onCanvasReady(canvas);
    }

    const handleResize = () => {
      canvas.setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 73,
      });
      canvas.renderAll();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
    };
  }, [onCanvasReady]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    if (tool === 'pen') {
      canvas.isDrawingMode = true;
      canvas.selection = false;
      canvas.forEachObject((obj) => {
        obj.selectable = false;
      });
    } else if (tool === 'eraser') {
      canvas.isDrawingMode = false;
      canvas.selection = false;

      canvas.forEachObject((obj) => {
        obj.selectable = true;
      });
      
      canvas.defaultCursor = 'crosshair';
      canvas.hoverCursor = 'crosshair';
    } else if (tool === 'select') {
      canvas.isDrawingMode = false;
      canvas.selection = true;
      canvas.forEachObject((obj) => {
        obj.selectable = true;
      });
    }

    canvas.renderAll();
  }, [tool]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !canvas.freeDrawingBrush) return;

    canvas.freeDrawingBrush.color = color;
  }, [color]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !canvas.freeDrawingBrush) return;

    canvas.freeDrawingBrush.width = strokeWidth;
  }, [strokeWidth]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const handleObjectClick = (e) => {
      if (tool === 'eraser' && e.target) {
        canvas.remove(e.target);
        canvas.renderAll();
      }
    };

    canvas.on('mouse:down', handleObjectClick);

    return () => {
      canvas.off('mouse:down', handleObjectClick);
    };
  }, [tool]);

  return (
    <div className="canvas-wrapper w-full h-full bg-white">
      <canvas ref={canvasRef} id="whiteboard-canvas" />
    </div>
  );
}

export default WhiteboardCanvas;