import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import socketService from '../services/socketService';

function WhiteboardCanvas({ 
  boardId,
  tool = 'pen',
  color = '#000000',
  strokeWidth = 2,
  onCanvasReady 
}) {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const currentPathRef = useRef(null);

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

    socketService.onRemoteObjectAdded((data) => {
      if (data.object) {
        fabric.util.enlivenObjects([data.object], (objects) => {
          objects.forEach((obj) => {
            obj.selectable = tool === 'select';
            canvas.add(obj);
          });
          canvas.renderAll();
        });
      }
    });

    socketService.onRemoteObjectRemoved((data) => {
      const objects = canvas.getObjects();
      const objToRemove = objects.find(obj => obj.id === data.objectId);
      if (objToRemove) {
        canvas.remove(objToRemove);
        canvas.renderAll();
      }
    });

    socketService.onRemoteClearCanvas(() => {
      canvas.clear();
      canvas.backgroundColor = '#ffffff';
      canvas.renderAll();
    });

    return () => {
      socketService.off('remote-object-added');
      socketService.off('remote-object-removed');
      socketService.off('remote-clear-canvas');
    };
  }, [tool]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const handleObjectAdded = (e) => {
      if (!e.target || isDrawingRef.current) return;
      
      const obj = e.target.toJSON();
      obj.id = `obj_${Date.now()}_${Math.random()}`;
      e.target.id = obj.id;

      socketService.emitObjectAdded(obj);
    };

    const handleObjectRemoved = (e) => {
      if (!e.target || !e.target.id) return;
      socketService.emitObjectRemoved(e.target.id);
    };

    const handlePathCreated = (e) => {
      const path = e.path;
      if (path) {
        const obj = path.toJSON();
        obj.id = `path_${Date.now()}_${Math.random()}`;
        path.id = obj.id;
        socketService.emitObjectAdded(obj);
      }
    };

    canvas.on('object:added', handleObjectAdded);
    canvas.on('object:removed', handleObjectRemoved);
    canvas.on('path:created', handlePathCreated);

    return () => {
      canvas.off('object:added', handleObjectAdded);
      canvas.off('object:removed', handleObjectRemoved);
      canvas.off('path:created', handlePathCreated);
    };
  }, []);

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