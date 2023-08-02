"use client";
import React, { useState, useEffect, useRef } from "react";
import ColorPalette from "./ColorPalette";
import ImageKit from "imagekit";
import useLocalStorage from "../hooks/useLocalStorage";
import useZoom from "../hooks/useZoom";
import useCanvas from "../hooks/useCanvas";
import useArtworkDrawing from "../hooks/useArtworkDrawing";
const COLORS = ["black", "red", "green", "blue", "yellow", "purple"]; // Add more colors if needed
const PLACEHOLDER_HEIGHT = 3995;
const PLACEHOLDER_WIDTH = 3153;

function PixelCanvas() {
  const isLocalStorageAvailable = typeof localStorage !== "undefined";

  const placeholderRef = useRef<HTMLDivElement>(null);

  const [zoom, handleZoom] = useZoom(1);
  const [placeholderSize, setPlaceholderSize] = useState({
    width: 0,
    height: 0,
  });
  const [numRows, setNumRows] = useLocalStorage<number>("numRows", 20);
  const [numCols, setNumCols] = useLocalStorage<number>("numCols", 20);
  const [pixelSize, setPixelSize] = useLocalStorage<number>("pixelSize", 10);
  const [artwork, setArtwork] = useLocalStorage<
    { row: number; col: number; color: string }[]
  >("artwork", []);

  const [isDrawing, setIsDrawing] = useState(false);
  const lastPixelRef = useRef<{ row: number; col: number } | null>(null);
  const [mainColor, setMainColor] = useState<string>("black"); // State for the main color

  const drawPixel = useArtworkDrawing(
    numRows,
    numCols,
    pixelSize,
    mainColor,
    artwork,
    setArtwork
  );

  const drawArtwork = (ctx: CanvasRenderingContext2D) => {
    for (const { row, col, color } of artwork) {
      if (col < numCols && row < numRows) {
        ctx.fillStyle = color;
        ctx.fillRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize);
      }
    }
  };

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = "rgba(219, 219, 219, 1)";
    ctx.lineWidth = 1 / zoom; // Adjust the line width based on the zoom level

    for (let row = 0; row <= numRows; row++) {
      ctx.beginPath();
      ctx.moveTo(0, row * pixelSize);
      ctx.lineTo(numCols * pixelSize, row * pixelSize);
      ctx.stroke();
    }
    for (let col = 0; col <= numCols; col++) {
      ctx.beginPath();
      ctx.moveTo(col * pixelSize, 0);
      ctx.lineTo(col * pixelSize, numRows * pixelSize);
      ctx.stroke();
    }
  };

  const canvasRef = useCanvas(
    numRows,
    numCols,
    pixelSize,
    zoom,
    placeholderSize,
    drawGrid,
    drawArtwork
  );

  const handleColorChange = (color: string) => {
    setMainColor(color); // Update the main color state when a color is selected from the palette
  };

  useEffect(() => {
    if (isLocalStorageAvailable) {
      const savedNumRows = localStorage.getItem("numRows");
      const savedNumCols = localStorage.getItem("numCols");
      const savedPixelSize = localStorage.getItem("pixelSize");
      const savedArtwork = localStorage.getItem("artwork");

      if (savedNumRows) setNumRows(parseInt(savedNumRows));
      if (savedNumCols) setNumCols(parseInt(savedNumCols));
      if (savedPixelSize) setPixelSize(parseInt(savedPixelSize));
      if (savedArtwork) setArtwork(JSON.parse(savedArtwork));
    }
  }, [isLocalStorageAvailable]);

  useEffect(() => {
    // Save state to localStorage if available
    if (isLocalStorageAvailable) {
      localStorage.setItem("numRows", numRows.toString());
      localStorage.setItem("numCols", numCols.toString());
      localStorage.setItem("pixelSize", pixelSize.toString());
      localStorage.setItem("artwork", JSON.stringify(artwork));
    }
  }, [numRows, numCols, pixelSize, artwork, isLocalStorageAvailable]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = numCols * pixelSize * devicePixelRatio;
    canvas.height = numRows * pixelSize * devicePixelRatio;

    canvas.style.width = numCols * pixelSize + "px";
    canvas.style.height = numRows * pixelSize + "px";

    ctx.scale(devicePixelRatio, devicePixelRatio);
    ctx.imageSmoothingEnabled = false;

    drawGrid(ctx);
    drawArtwork(ctx);
  }, [numRows, numCols, pixelSize]);

  useEffect(() => {
    if (placeholderRef.current) {
      const { offsetWidth, offsetHeight } = placeholderRef.current;

      // Determine the number of rows and columns based on the placeholder size and pixel size
      const calculatedNumRows = Math.floor(offsetHeight / pixelSize);
      const calculatedNumCols = Math.floor(offsetWidth / pixelSize);

      // Update the numRows and numCols state variables
      setNumRows(calculatedNumRows);
      setNumCols(calculatedNumCols);

      setPlaceholderSize({ width: offsetWidth, height: offsetHeight });
    }
  }, [pixelSize]);

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
  }, [placeholderSize]);

  const handlePixelSizeChange = (size: number) => {
    if (size < 5) return;
    setPixelSize(size);
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    drawPixel(event, zoom);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDrawing) {
      drawPixel(event, zoom);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    lastPixelRef.current = null;
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Reset the artwork state to an empty array
    drawGrid(ctx);
    setArtwork([]);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Temporarily remove the grid lines and draw the artwork on the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawArtwork(ctx);

    // Create a new canvas to draw the artwork
    const downloadCanvas = document.createElement("canvas");
    downloadCanvas.width = canvas.width;
    downloadCanvas.height = canvas.height;
    const downloadCtx = downloadCanvas.getContext("2d");
    if (!downloadCtx) return;

    // Draw the artwork on the new canvas
    downloadCtx.drawImage(
      canvas,
      0,
      0,
      canvas.width,
      canvas.height,
      0,
      0,
      canvas.width,
      canvas.height
    );

    // Create a temporary link to download the canvas as an image
    const link = document.createElement("a");
    link.href = downloadCanvas.toDataURL("image/png");
    link.download = "pixel_artwork.png";
    link.click();

    // Restore the original canvas with the grid lines and the artwork
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx);
    drawArtwork(ctx);
  };

  return (
    <div onWheel={handleZoom} className="flex flex-col items-center">
      <div className="text-black">
        <div className="flex flex-col absolute right-28 w-32">
          <button
            className="text-black border border-gray-200"
            onClick={handleClearCanvas}
          >
            Clear Canvas
          </button>

          <label>
            Pixel Size:
            <input
              type="number"
              value={pixelSize}
              onChange={(e) => handlePixelSizeChange(parseInt(e.target.value))}
            />
          </label>
        </div>
      </div>
      <ColorPalette
        colors={COLORS}
        selectedColor={mainColor} // Pass the mainColor as the selectedColor prop
        onColorChange={handleColorChange}
      />
      <div className=" absolute bg-black top-5">
        Height : {(PLACEHOLDER_HEIGHT / 300).toFixed(2)}" Width:
        {(PLACEHOLDER_WIDTH / 300).toFixed(2)}"
      </div>

      <button
        className="text-black border border-gray-200"
        onClick={handleDownload}
      >
        Download Artwork
      </button>
      <div
        ref={placeholderRef}
        style={{
          width: PLACEHOLDER_WIDTH / 4,
          height: PLACEHOLDER_HEIGHT / 4,
          // overflow: "hidden", // Hide any overflowing content
          display: "inline-block", // Wrap the canvas without taking the full width
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: "100%", transform: `scale(${zoom})` }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        ></canvas>
      </div>
    </div>
  );
}

export default PixelCanvas;
