"use client";
import React, { useState, useEffect, useRef } from "react";
import ColorPalette from "./ColorPalette";
const COLORS = ["black", "red", "green", "blue", "yellow", "purple"]; // Add more colors if needed
const PLACEHOLDER_HEIGHT = 3995;
const PLACEHOLDER_WIDTH = 3153;

function PixelCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const [placeholderSize, setPlaceholderSize] = useState({
    width: 0,
    height: 0,
  });
  const [numRows, setNumRows] = useState<number>(() => {
    const savedNumRows = localStorage.getItem("numRows");
    return savedNumRows ? parseInt(savedNumRows) : 20;
  });

  const [numCols, setNumCols] = useState<number>(() => {
    const savedNumCols = localStorage.getItem("numCols");
    return savedNumCols ? parseInt(savedNumCols) : 20;
  });

  const [pixelSize, setPixelSize] = useState<number>(() => {
    const savedPixelSize = localStorage.getItem("pixelSize");
    return savedPixelSize ? parseInt(savedPixelSize) : 10;
  });

  const [isDrawing, setIsDrawing] = useState(false);
  const lastPixelRef = useRef<{ row: number; col: number } | null>(null);
  const [artwork, setArtwork] = useState<
    { row: number; col: number; color: string }[] // Update the type to include the 'color' property
  >(() => {
    const savedArtwork = localStorage.getItem("artwork");
    return savedArtwork ? JSON.parse(savedArtwork) : [];
  });
  const [mainColor, setMainColor] = useState<string>("black"); // State for the main color
  const [selectedColor, setSelectedColor] = useState<string>("black");

  const handleColorChange = (color: string) => {
    setMainColor(color); // Update the main color state when a color is selected from the palette
  };

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
    localStorage.setItem("numRows", numRows.toString());
    localStorage.setItem("numCols", numCols.toString());
    localStorage.setItem("pixelSize", pixelSize.toString());
  }, [numRows, numCols, pixelSize]);

  useEffect(() => {
    localStorage.setItem("artwork", JSON.stringify(artwork));
  }, [artwork]);

  useEffect(() => {
    if (placeholderRef.current) {
      const { offsetWidth, offsetHeight } = placeholderRef.current;

      const desiredNumRows = 20;
      const desiredNumCols = 20;

      const calculatedPixelSizeWidth = offsetWidth / desiredNumCols;
      const calculatedPixelSizeHeight = offsetHeight / desiredNumRows;

      const calculatedPixelSize = Math.floor(
        Math.min(calculatedPixelSizeWidth, calculatedPixelSizeHeight)
      ); // Use Math.floor to round down

      setPixelSize(calculatedPixelSize);
      setNumRows(desiredNumRows);
      setNumCols(desiredNumCols);
      setPlaceholderSize({ width: offsetWidth, height: offsetHeight });
    }
  }, []);

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

  const handleCanvasSizeChange = (rows: number, cols: number) => {
    setNumRows(rows);
    setNumCols(cols);
  };

  const handlePixelSizeChange = (size: number) => {
    setPixelSize(size);
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    drawPixel(event);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDrawing) {
      drawPixel(event);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    lastPixelRef.current = null;
  };

  const drawPixel = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;

    // Calculate the actual pixel coordinates based on the canvas size and display size
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

  const handleDownload = () => {
    // Draw the canvas without the grid lines and download the image
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Temporarily remove the grid lines
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawArtwork(ctx);

    // Create a temporary link to download the canvas as an image
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "pixel_artwork.png";
    link.click();

    // Restore the original canvas with the grid lines
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx);
    drawArtwork(ctx);
  };

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
    ctx.lineWidth = 1;
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

  const drawArtwork = (ctx: CanvasRenderingContext2D) => {
    for (const { row, col, color } of artwork) {
      ctx.fillStyle = color; // Use the 'color' property of each pixel in the artwork array
      ctx.fillRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize);
    }
  };

  return (
    <div className="flex justify-center items-center flex-col">
      <div className="text-black">
        <label>
          Rows:
          <input
            type="number"
            value={numRows}
            onChange={(e) =>
              handleCanvasSizeChange(parseInt(e.target.value), numCols)
            }
          />
        </label>
        <label>
          Columns:
          <input
            type="number"
            value={numCols}
            onChange={(e) =>
              handleCanvasSizeChange(numRows, parseInt(e.target.value))
            }
          />
        </label>
        <label>
          Pixel Size:
          <input
            type="number"
            value={pixelSize}
            onChange={(e) => handlePixelSizeChange(parseInt(e.target.value))}
          />
        </label>
      </div>
      <ColorPalette
        colors={COLORS}
        selectedColor={mainColor} // Pass the mainColor as the selectedColor prop
        onColorChange={handleColorChange} // Pass the handleColorChange function as the onColorChange prop
      />
      <div
        ref={placeholderRef}
        style={{
          width: PLACEHOLDER_WIDTH / 4,
          height: PLACEHOLDER_HEIGHT / 4,
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: "100%" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        ></canvas>
      </div>
      <button
        className="text-black border border-gray-200"
        onClick={handleDownload}
      >
        Download Artwork
      </button>
    </div>
  );
}

export default PixelCanvas;
