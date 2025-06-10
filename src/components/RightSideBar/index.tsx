import type { FC } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { togglePropertiesSidebar } from "@/features/ui/uiSlice";
import { Button } from "../ui/Button";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import CanvasProperties from "./RightPanels/CanvasProperties";
import { ShapeProperties } from "./RightPanels/ShapeProperties";
import { FrameProperties } from "./RightPanels/FrameProperties";
import { ImageProperties } from "./RightPanels/ImageProperties";
import TextProperties from "./RightPanels/TextProperties";
import type { CanvasElementUnion, CanvasFrameElement, CanvasTextElement } from "@/features/canvas/types";
import { IconProperties } from "./RightPanels/IconProperties";

interface RootState {
  ui: {
    propertiesSidebarOpen: boolean;
  };
  canvas: {
    elements: CanvasElementUnion[];
  };
}

const shapes = [
  "circle",
  "rectangle",
  "ellipse",
  "line",
  "triangle",
  "star",
  "regularPolygon",
  "arc",
  "wedge",
  "ring",
  "arrow",
  "custom",
];

const RightSideBar: FC = () => {
  const dispatch = useAppDispatch();
  const propertiesSidebarOpen = useAppSelector(
    (state: RootState) => state.ui.propertiesSidebarOpen
  );
  const selectedElement = useAppSelector((state: RootState) =>
    state.canvas.elements.find((el) => el.selected)
  );

  if (!propertiesSidebarOpen) {
    return (
      <div className="flex justify-end">
        <Button
          variant="ghost"
          className="mt-4 mx-2"
          onClick={() => dispatch(togglePropertiesSidebar())}
          title="Open properties"
        >
          <IoIosArrowBack className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full w-64 bg-card border-l overflow-y-auto">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Properties</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch(togglePropertiesSidebar())}
          title="Close properties"
        >
          <IoIosArrowForward className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-4">
        {!selectedElement && <CanvasProperties />}
        {selectedElement && shapes.includes(selectedElement.type) && (
          <ShapeProperties
            key={selectedElement.type}
            element={selectedElement}
          />
        )}
        {selectedElement?.type === "frame" && (
          <FrameProperties key="frame" element={selectedElement as CanvasFrameElement} />
        )}

        {/* {selectedElement && selectedElement.type === "frame" && (
          <FrameProperties key="frame" element={selectedElement} />
        )} */}
        {selectedElement && selectedElement.type === "image" && (
          <ImageProperties key="image" element={selectedElement} />
        )}
        {/* {selectedElement && selectedElement.type === "text" && (
          <TextProperties key="text" element={selectedElement} />
        )} */}

        {selectedElement?.type === "text" && (
          <TextProperties key="text" element={selectedElement as CanvasTextElement} />
        )}

        {selectedElement?.type === "icon" && (
          <IconProperties key="icon" element={selectedElement as CanvasTextElement} />
        )}

      </div>
    </div>
  );
};

export default RightSideBar;
