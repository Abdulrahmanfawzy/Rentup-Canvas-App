import { useRef, type FC } from "react";
import { FaFileImport, FaSave } from "react-icons/fa";
import { Button } from "../../ui/Button";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import type { RootState } from "@/app/store";
import {
  setElements,
  setStageSize,
  setAspectRatio,
} from "@/features/canvas/canvasSlice";

const CanvasExportImport: FC = () => {
  const dispatch = useAppDispatch();
  const elements = useAppSelector((state: RootState) => state.canvas.elements);
  const stageHeight = useAppSelector(
    (state: RootState) => state.canvas.stageHeight
  );
  const stageWidth = useAppSelector(
    (state: RootState) => state.canvas.stageWidth
  );
  const aspectRatio = useAppSelector(
    (state: RootState) => state.canvas.aspectRatio
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export handler
  const handleExport = () => {
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

  // Import handler
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const importedData = JSON.parse(reader.result as string);

        if (
          importedData &&
          Array.isArray(importedData.elements) &&
          importedData.stage &&
          importedData.stage.height &&
          importedData.stage.width &&
          importedData.stage.aspectRatio
        ) {
          dispatch(setElements(importedData.elements));
          dispatch(
            setStageSize({
              height: importedData.stage.height,
              width: importedData.stage.width,
            })
          );
          dispatch(setAspectRatio(importedData.stage.aspectRatio));
          // dispatch(setStageDimensions(importedData.stage));
        } else {
          alert("Invalid file format.");
        }
      } catch (error) {
        alert("Failed to import. Invalid JSON.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <div className="flex flex-row items-center justify-center gap-2">
        <Button
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
        >
          <FaFileImport className="mr-2" />
          Import
        </Button>
        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          className="hidden"
          onChange={handleImport}
        />
        <Button variant="default" onClick={handleExport}>
          <FaSave className="mr-2" />
          Export
        </Button>
      </div>
    </>
  );
};

export default CanvasExportImport;
