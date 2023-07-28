"use client";
import React from "react";
import PixelCanvas from "./PixelCanvas";

type PlaceholderProps = {
  placeholders: { position: string; height: number; width: number }[];
  onPlaceholderChange: (newData: any) => void; // replace with actual data type
};

const Placeholder = ({
  placeholders,
  onPlaceholderChange,
}: PlaceholderProps) => {
  const handleArtworkChange = (newData: any) => {
    // handle the changes in the artwork here and pass it to onPlaceholderChange
    onPlaceholderChange(newData);
  };

  // assuming we will take the first placeholder for now
  const { position, height, width } = placeholders[0];
  const aspectRatio = width / height;

  // set maximum height and width based on the viewport
  const maxHeight = window.innerHeight * 0.8; // 80% of the viewport height
  const maxWidth = window.innerWidth * 0.8; // 80% of the viewport width

  // calculate the dimensions of the canvas while maintaining aspect ratio
  const canvasHeight = Math.min(maxHeight, maxWidth / aspectRatio);
  const canvasWidth = canvasHeight * aspectRatio;

  return (
    <div>
      <h2>{`Position: ${position}`}</h2>
      <PixelCanvas
        artwork={[]} // pass initial artwork
        onArtworkChange={handleArtworkChange} // update placeholder data when artwork changes
        canvasHeight={canvasHeight}
        canvasWidth={canvasWidth}
      />
    </div>
  );
};

export default Placeholder;
