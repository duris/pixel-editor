// useArtworkDrawing.ts
import { useRef } from "react";

function useArtworkDrawing(
  numRows: number,
  numCols: number,
  pixelSize: number,
  mainColor: string,
  artwork: { row: number; col: number; color: string }[],
  setArtwork: React.Dispatch<
    React.SetStateAction<{ row: number; col: number; color: string }[]>
  >
) {
  const lastPixelRef = useRef<{ row: number; col: number } | null>(null);

  const drawPixel = (
    event: React.MouseEvent<HTMLCanvasElement>,
    zoom: number
  ) => {
    const canvas = event.currentTarget;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const canvasX = (event.clientX - rect.left) * (1 / zoom); // Adjust x-coordinate for zoom
    const canvasY = (event.clientY - rect.top) * (1 / zoom); // Adjust y-coordinate for zoom

    // Calculate the actual pixel coordinates based on the adjusted canvas size and display size
    const col = Math.floor(canvasX / pixelSize);
    const row = Math.floor(canvasY / pixelSize);

    // Only draw if the pixel is different from the last one to prevent redundant drawing
    // And also check whether the pixel is within the canvas bounds
    if (
      (!lastPixelRef.current ||
        lastPixelRef.current.row !== row ||
        lastPixelRef.current.col !== col) &&
      col < numCols &&
      row < numRows
    ) {
      ctx.fillStyle = mainColor;
      ctx.fillRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize);

      lastPixelRef.current = { row, col };
      setArtwork((prevArtwork) => [
        ...prevArtwork,
        { row, col, color: mainColor }, // Store the selected color along with the row and column
      ]);
    }
  };

  return drawPixel;
}

export default useArtworkDrawing;
