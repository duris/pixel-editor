"use client";
import React from "react";

interface ColorPaletteProps {
  colors: string[];
  selectedColor: string;
  onColorChange: (color: string) => void;
}

const ColorPalette: React.FC<ColorPaletteProps> = ({
  colors,
  selectedColor,
  onColorChange,
}) => {
  return (
    <div>
      <div>
        Color Palette:
        {colors.map((color) => (
          <button
            key={color}
            style={{
              backgroundColor: color,
              border: color === selectedColor ? "2px solid black" : "none",
              width: "30px", // Set the width of the button
              height: "30px", // Set the height of the button
            }}
            onClick={() => onColorChange(color)}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default ColorPalette;
