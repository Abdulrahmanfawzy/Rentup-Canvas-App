import type { StageProps } from "react-konva";
import { type CanvasElement } from "../features/canvas/types";

// Export canvas as PNG or JPEG
export function exportAsImage(stage: StageProps, type: "png" | "jpeg" = "png") {
  const uri = stage.toDataURL({
    mimeType: type === "jpeg" ? "image/jpeg" : "image/png",
    quality: 1,
  });

  const link = document.createElement("a");
  link.download = `canvas.${type}`;
  link.href = uri;
  link.click();
}

// Export canvas elements as JSON
export function exportAsJSON(elements: CanvasElement[]) {
  const json = JSON.stringify(elements, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.download = "canvas.json";
  link.href = url;
  link.click();
}

// Import canvas elements from JSON
export function importFromJSON(
  file: File,
  onLoad: (elements: CanvasElement[]) => void
) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result as string);
      if (Array.isArray(parsed)) {
        onLoad(parsed);
      } else {
        alert("Invalid JSON structure");
      }
    } catch {
      alert("Invalid JSON file");
    }
  };
  reader.readAsText(file);
}
