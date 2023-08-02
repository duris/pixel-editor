// useZoom.ts

import { useState } from "react";

function useZoom(initialZoom = 1) {
  const [zoom, setZoom] = useState(initialZoom);

  const handleZoom = (event: React.WheelEvent<HTMLDivElement>) => {
    const deltaY = -event.deltaY;

    // Adjust the zoom level based on the deltaY value
    setZoom((prevZoom) => {
      let newZoom = prevZoom + deltaY * 0.001;

      // Limit zoom out to a maximum of 1
      if (deltaY > 0) {
        newZoom = Math.min(3, newZoom);
      }
      // Limit zoom in to a minimum of 0.4
      else {
        newZoom = Math.max(0.5, newZoom);
      }

      return newZoom;
    });
  };

  return [zoom, handleZoom] as const;
}

export default useZoom;
