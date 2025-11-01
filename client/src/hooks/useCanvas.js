import { useRef, useCallback } from 'react';

function useCanvas() {
  const canvasRef = useRef(null);

  const setCanvas = useCallback((canvas) => {
    canvasRef.current = canvas;
  }, []);

  const getCanvas = useCallback(() => {
    return canvasRef.current;
  }, []);

  const clearCanvas = useCallback(() => {
    if (canvasRef.current) {
      canvasRef.current.clear();
      canvasRef.current.backgroundColor = '#ffffff';
      canvasRef.current.renderAll();
    }
  }, []);

  const exportAsImage = useCallback((format = 'png') => {
    if (!canvasRef.current) return null;
    
    const dataURL = canvasRef.current.toDataURL({
      format: format,
      quality: 1
    });
    
    return dataURL;
  }, []);

  const downloadCanvas = useCallback((filename = 'whiteboard') => {
    const dataURL = exportAsImage('png');
    if (!dataURL) return;

    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [exportAsImage]);

  const getCanvasJSON = useCallback(() => {
    if (!canvasRef.current) return null;
    return canvasRef.current.toJSON();
  }, []);

  const loadCanvasJSON = useCallback((json) => {
    if (!canvasRef.current || !json) return;
    
    canvasRef.current.loadFromJSON(json, () => {
      canvasRef.current.renderAll();
    });
  }, []);

  const undo = useCallback(() => {
    if (!canvasRef.current) return;
    
    const objects = canvasRef.current.getObjects();
    if (objects.length > 0) {
      canvasRef.current.remove(objects[objects.length - 1]);
      canvasRef.current.renderAll();
    }
  }, []);

  const getObjectCount = useCallback(() => {
    if (!canvasRef.current) return 0;
    return canvasRef.current.getObjects().length;
  }, []);

  return {
    setCanvas,
    getCanvas,
    clearCanvas,
    exportAsImage,
    downloadCanvas,
    getCanvasJSON,
    loadCanvasJSON,
    undo,
    getObjectCount
  };
}

export default useCanvas;