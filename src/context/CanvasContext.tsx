import { createContext, useContext, type FC, type RefObject } from "react";
import Konva from "konva";
import { useAppSelector } from "@/hooks/useRedux";

interface CanvasContextType {
  stageRef: RefObject<Konva.Stage>;
  handleExportJSON: () => void;
  handleExportPNG: () => void;
  handleExportSVG: () => void;
  handleImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const CanvasProvider: FC<{
  children: React.ReactNode;
  stageRef: RefObject<Konva.Stage>;
}> = ({ children, stageRef }) => {
  const elements = useAppSelector((state) => state.canvas.elements);
  const stageHeight = useAppSelector((state) => state.canvas.stageHeight);
  const stageWidth = useAppSelector((state) => state.canvas.stageWidth);
  const aspectRatio = useAppSelector((state) => state.canvas.aspectRatio);

  const handleExportJSON = () => {
    const exportData = {
      elements,
      stage: {
        height: stageHeight,
        width: stageWidth,
        aspectRatio: aspectRatio,
      },
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "canvas-design.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPNG = () => {
    if (!stageRef.current) {
      alert("Stage is not available.");
      return;
    }
    try {
      const dataURL = stageRef.current.toDataURL({
        mimeType: "image/png",
        quality: 1,
      });
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = "canvas-design.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert("Failed to export PNG.");
      console.error(error);
    }
  };

  const handleExportSVG = () => {
    if (!stageRef.current) {
      alert("Stage is not available.");
      return;
    }
    try {
      // Konva doesn't natively support SVG export, so we use toDataURL as a fallback
      // Alternatively, you could use a library like konva2svg if available
      const dataURL = stageRef.current.toDataURL({
        mimeType: "image/svg+xml",
      });
      const blob = new Blob([dataURL], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "canvas-design.svg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert("Failed to export SVG.");
      console.error(error);
    }
  };

  const handleImport = () => {
    // Import logic moved to CanvasExportImport for consistency
    // This is just a placeholder to satisfy the interface
  };

  const value: CanvasContextType = {
    stageRef,
    handleExportJSON,
    handleExportPNG,
    handleExportSVG,
    handleImport,
  };

  return (
    <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
  );
};

export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error("useCanvas must be used within a CanvasProvider");
  }
  return context;
};
