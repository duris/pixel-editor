// useCanvas.ts
import { useEffect, useRef } from "react";

function useCanvas(
  numRows: number,
  numCols: number,
  pixelSize: number,
  zoom: number,
  placeholderSize: { width: number; height: number },
  drawGrid: (ctx: CanvasRenderingContext2D) => void,
  drawArtwork: (ctx: CanvasRenderingContext2D) => void
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const devicePixelRatio = window.devicePixelRatio || 1;
    const canvasWidth = placeholderSize.width;
    const canvasHeight = placeholderSize.height;

    canvas.width = canvasWidth * devicePixelRatio;
    canvas.height = canvasHeight * devicePixelRatio;

    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    ctx.scale(devicePixelRatio, devicePixelRatio);
    ctx.imageSmoothingEnabled = false;

    drawGrid(ctx);
    drawArtwork(ctx);
  }, [
    numRows,
    numCols,
    pixelSize,
    zoom,
    placeholderSize,
    drawGrid,
    drawArtwork,
  ]);

  return canvasRef;
}

export default useCanvas;
