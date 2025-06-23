import { createContext, useContext, type FC, type RefObject } from "react";
import Konva from "konva";
import { useAppSelector } from "@/hooks/useRedux";
import transformElementsKeys from "@/utils/transformElementKeys";

interface CanvasContextType {
  stageRef: RefObject<Konva.Stage>;
  handleExportJSON: () => void;
  handleExportPNG: () => void;
  handleExportSVG: () => void;
  handleExportSummary: () => void;
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
  const brandingColors = useAppSelector((state) => state.branding.colors);
  const brandingFonts = useAppSelector((state) => state.branding.fontFamilies);

  const handleExportJSON = () => {
    const keyMappingsByType = {
      text: {
        backgroundStrokeWidth: "borderWidth",
        backgroundStroke: "borderColor",
        dashed: "borderStyle",
      },
      frame: {
        dash: "borderStyle",
        strokeWidth: "borderWidth",
        stroke: "borderColor",
        fitMode: "objectFit",
      },
    };

    const fallbackMapping = {
      stroke: "borderColor",
      strokeWidth: "borderWidth",
      backgroundStroke: "borderColor",
      backgroundStrokeWidth: "borderWidth",
      dashed: "borderStyle",
    };

    const transformedElements = transformElementsKeys(
      elements,
      keyMappingsByType,
      fallbackMapping
    );

    const exportData = {
      elements: transformedElements,
      stage: {
        height: stageHeight,
        width: stageWidth,
        aspectRatio: aspectRatio,
      },
      branding: {
        colors: brandingColors,
        fonts: brandingFonts,
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

  const handleExportSummary = () => {
    const frames: {
      assetType: string | null;
      tags: string[];
      frame_position_in_template: number | null;
    }[] = [];

    const texts: {
      id: string;
      tags: string[];
      toi_labels: string[];
    }[] = [];

    elements.forEach((el) => {
      if (el.type === "frame") {
        const frameEl = el as {
          assetType?: string;
          tags?: string[];
          frame_position_in_template?: number;
        };

        frames.push({
          assetType: frameEl.assetType || null,
          tags: frameEl.tags || [],
          frame_position_in_template:
            frameEl.frame_position_in_template ?? null,
        });
      } else if (el.type === "text") {
        const textEl = el as {
          id: string;
          tags: string[];
          toi_labels?: string[];
        };

        texts.push({
          id: textEl.id,
          tags: textEl.tags || [],
          toi_labels: textEl.toi_labels || [],
        });
      }
    });

    const summary = {
      frames,
      texts,
    };

    const dataStr = JSON.stringify(summary, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "canvas-summary.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const value: CanvasContextType = {
    stageRef,
    handleExportSummary,
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
