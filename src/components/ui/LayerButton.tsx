import { useState } from "react";
import { LayerPanel } from "../LeftSideBar/MainLeftSidebar/LeftPanels/LayerPanel";

export function LayerButton() {
  const [showLayers, setShowLayers] = useState(false);

  return (
    <div className="relative inline-block">
      {/* Toggle Button */}
      <button onClick={() => setShowLayers((prev) => !prev)} className="fancy-button">
        {showLayers ? "Hide Layers" : "Show Layers"}
      </button>

      {/* Layer Panel */}
      {showLayers && (
        <div
          className="
            absolute 
            left-0 
            top-full 
            mt-2 
            z-10 
            bg-white 
            shadow-lg 
            rounded 
            transition 
            duration-300 
            ease-in-out 
            opacity-100
          "
        >
          <LayerPanel />
        </div>
      )}
    </div>
  );
}
