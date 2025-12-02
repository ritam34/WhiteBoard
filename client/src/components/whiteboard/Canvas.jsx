import { useEffect, useRef } from "react";
import { fabric } from "fabric";

const Canvas = ({
  canvasRef,
  fabricCanvasRef,
  currentTool,
  strokeColor,
  strokeWidth,
  fillColor,
  onDrawingStart,
  onDrawingMove,
  onDrawingEnd,
  onObjectAdded,
  onObjectModified,
  onObjectRemoved,
}) => {
  const isDrawing = useRef(false);
  const currentShape = useRef(null);
  const startPoint = useRef(null);

  useEffect(() => {
    const el = canvasRef.current;
    const canvas = new fabric.Canvas(el, {
      width: window.innerWidth - 320,
      height: window.innerHeight - 64,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
      selection: false,
    });

    fabricCanvasRef.current = canvas;

    const handleResize = () => {
      canvas.setDimensions({
        width: window.innerWidth - 320,
        height: window.innerHeight - 64,
      });
      canvas.renderAll();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, []);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.selection = currentTool === "select";

    canvas.forEachObject((obj) => {
      obj.selectable = currentTool === "select";
      obj.evented = currentTool !== "pen"; 
    });

    if (currentTool === "pen") {
      canvas.isDrawingMode = true;

      if (!canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      }

      canvas.freeDrawingBrush.width = strokeWidth;
      canvas.freeDrawingBrush.color = strokeColor;
      return;
    }

    canvas.isDrawingMode = false;
    canvas.renderAll();
  }, [currentTool, strokeColor, strokeWidth]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (opt) => {
      const ev = opt?.e;
      const pointer = canvas.getPointer(ev);

      if (currentTool === "select") return;

      if (currentTool === "pen") {
        isDrawing.current = true;
        onDrawingStart?.();
        return;
      }

      if (currentTool === "eraser") {
        if (opt.target) {
          canvas.remove(opt.target);
          canvas.requestRenderAll();
          onObjectRemoved?.(opt.target);
        }
        return;
      }

      isDrawing.current = true;
      startPoint.current = pointer;

      if (["rectangle", "circle", "line"].includes(currentTool)) {
        const baseProps = {
          left: pointer.x,
          top: pointer.y,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          fill: fillColor === "transparent" ? "" : fillColor,
          selectable: false,
          evented: false,
        };

        let shape;
        if (currentTool === "rectangle") {
          shape = new fabric.Rect({
            ...baseProps,
            width: 0,
            height: 0,
          });
        } else if (currentTool === "circle") {
          shape = new fabric.Circle({
            ...baseProps,
            radius: 0,
          });
        } else if (currentTool === "line") {
          shape = new fabric.Line(
            [pointer.x, pointer.y, pointer.x, pointer.y],
            baseProps
          );
        }

        if (shape) {
          currentShape.current = shape;
          canvas.add(shape);
          canvas.renderAll();
        }
      }

      if (currentTool === "text") {
        const text = new fabric.IText("", {
          left: pointer.x,
          top: pointer.y,
          fill: strokeColor,
          fontFamily: "Arial",
          fontSize: 40,
        });

        canvas.add(text);
        canvas.setActiveObject(text);

        setTimeout(() => {
          text.enterEditing();
          text.hiddenTextarea?.focus();
        }, 20);

        onObjectAdded?.(text);
      }
    };

    const handleMouseMove = (opt) => {
      if (!isDrawing.current) return;
      const pointer = canvas.getPointer(opt.e);

      if (currentShape.current) {
        const shape = currentShape.current;

        if (shape.type === "rect") {
          shape.set({
            width: Math.abs(pointer.x - startPoint.current.x),
            height: Math.abs(pointer.y - startPoint.current.y),
            left:
              pointer.x < startPoint.current.x
                ? pointer.x
                : startPoint.current.x,
            top:
              pointer.y < startPoint.current.y
                ? pointer.y
                : startPoint.current.y,
          });
        } else if (shape.type === "circle") {
          const dx = pointer.x - startPoint.current.x;
          const dy = pointer.y - startPoint.current.y;
          const radius = Math.sqrt(dx * dx + dy * dy) / 2;

          shape.set({
            radius,
            left: startPoint.current.x - radius,
            top: startPoint.current.y - radius,
          });
        } else if (shape.type === "line") {
          shape.set({ x2: pointer.x, y2: pointer.y });
        }

        canvas.renderAll();
      }

      onDrawingMove?.(pointer);
    };

    const handleMouseUp = () => {
      if (!isDrawing.current) return;
      isDrawing.current = false;

      if (currentShape.current) {
        const obj = currentShape.current;
        currentShape.current = null;

        onDrawingEnd?.(obj);
      }
    };

    const handleObjectAddedWrapper = (e) => {
      const obj = e.target;
      if (obj) onObjectAdded?.(obj);
    };

    const handleObjectModifiedWrapper = (e) => {
      const obj = e.target;
      if (obj) onObjectModified?.(obj);
    };

    const handleObjectRemovedWrapper = (e) => {
      const obj = e.target;
      if (obj) onObjectRemoved?.(obj);
    };

    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);
    canvas.on("object:added", handleObjectAddedWrapper);
    canvas.on("object:modified", handleObjectModifiedWrapper);
    canvas.on("object:removed", handleObjectRemovedWrapper);

    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
      canvas.off("object:added", handleObjectAddedWrapper);
      canvas.off("object:modified", handleObjectModifiedWrapper);
      canvas.off("object:removed", handleObjectRemovedWrapper);
    };
  }, [currentTool, strokeColor, strokeWidth, fillColor]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !canvas.freeDrawingBrush) return;
    canvas.freeDrawingBrush.width = strokeWidth;
    canvas.freeDrawingBrush.color = strokeColor;
  }, [strokeColor, strokeWidth]);

  return (
    <div className="flex-1 overflow-hidden bg-gray-100">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default Canvas;
