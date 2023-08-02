import React from "react";

type GridProps = {
  numRows: number;
  numCols: number;
  pixelSize: number;
  zoom: number;
};

const Grid: React.FC<GridProps> = ({ numRows, numCols, pixelSize, zoom }) => {
  const canvasWidth = numCols * pixelSize * zoom;
  const canvasHeight = numRows * pixelSize * zoom;

  return (
    <svg
      width={canvasWidth}
      height={canvasHeight}
      style={{
        position: "absolute",
        pointerEvents: "none", // Make the SVG elements ignore mouse events
      }}
    >
      {/* Render the horizontal grid lines */}
      {Array.from({ length: numRows + 1 }).map((_, index) => (
        <line
          key={`h-line-${index}`}
          x1={0}
          y1={index * pixelSize}
          x2={canvasWidth}
          y2={index * pixelSize}
          stroke="rgba(219, 219, 219, 1)"
          strokeWidth={1}
        />
      ))}

      {/* Render the vertical grid lines */}
      {Array.from({ length: numCols + 1 }).map((_, index) => (
        <line
          key={`v-line-${index}`}
          x1={index * pixelSize}
          y1={0}
          x2={index * pixelSize}
          y2={canvasHeight}
          stroke="rgba(219, 219, 219, 1)"
          strokeWidth={1}
        />
      ))}
    </svg>
  );
};

export default Grid;
