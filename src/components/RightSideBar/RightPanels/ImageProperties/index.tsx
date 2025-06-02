import { useAppDispatch } from "@/hooks/useRedux";
import { updateElement } from "@/features/canvas/canvasSlice";
import type { CanvasElement } from "@/features/canvas/types";
// import { TextInput } from "@/components/ui/controlled-inputs/TextInput";
import { useSelector } from "react-redux";
import PositionProperties from "../CommonProperties/PositionProperties";
import ScaleProperties from "../CommonProperties/ScaleProperties";
import SelectInput from "@/components/ui/controlled-inputs/SelectInput";

export function ImageProperties({ element }: { element: CanvasElement }) {
  const dispatch = useAppDispatch();
  const elements = useSelector((store: any) => store.canvas.elements);

  const handleFitModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFitMode = e.target.value;

    const frame = elements.find((f: CanvasElement) => f.id === element.frameId);

    const imgW = element.originalWidth; // ✅ مش element.width
    const imgH = element.originalHeight; // ✅ مش element.height

    if (frame && imgW && imgH) {
      const frameAspect = frame.width / frame.height;
      const imgAspect = imgW / imgH;

      let newWidth, newHeight, offsetX, offsetY;

      switch (newFitMode) {
        case "fit":
          if (imgAspect > frameAspect) {
            newWidth = frame.width;
            newHeight = frame.width / imgAspect;
          } else {
            newHeight = frame.height;
            newWidth = frame.height * imgAspect;
          }
          break;

        case "fill":
        default:
          if (imgAspect < frameAspect) {
            newWidth = frame.width;
            newHeight = frame.width / imgAspect;
          } else {
            newHeight = frame.height;
            newWidth = frame.height * imgAspect;
          }
          break;

        case "stretch":
          newWidth = frame.width;
          newHeight = frame.height;
          break;
      }

      offsetX = (frame.width - newWidth) / 2;
      offsetY = (frame.height - newHeight) / 2;

      dispatch(
        updateElement({
          id: element.id,
          updates: {
            fitMode: newFitMode as CanvasElement["fitMode"],
            x: frame.x + offsetX,
            y: frame.y + offsetY,
            width: newWidth,
            height: newHeight,
          },
        })
      );
    } else {
      dispatch(
        updateElement({
          id: element.id,
          updates: { fitMode: newFitMode as CanvasElement["fitMode"] },
        })
      );
    }
  };

  // const update = <T extends CanvasElement>(updates: Partial<T>) => {
  //   dispatch(updateElement({ id: element.id, updates }));
  //   console.log(element);
  // };

  return (
    <div className="space-y-4">
      {/* Common Shape Properties */}
      <PositionProperties element={element} />
      <ScaleProperties element={element} />
      {/* <TextInput
        label="Label"
        type="text"
        value={""}
        onChange={(val) => update({ label: val })}
      /> */}
      <SelectInput
        label="Image Fit Mode"
        value={element.fitMode || "fill"}
        options={["fill", "fit", "stretch"]}
        onChange={(val) =>
          handleFitModeChange({
            target: { value: val },
          } as React.ChangeEvent<HTMLSelectElement>)
        }
      />
      <div className="space-y-1 mt-3">
        <label className="text-sm font-medium">Image Preview</label>
        <img
          src={element.src}
          alt="Preview"
          className="w-full h-auto rounded border"
        />
      </div>
    </div>
  );
}
