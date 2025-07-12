import { useAppDispatch } from "@/hooks/useRedux";
import { updateElement } from "@/features/canvas/canvasSlice";
import type { CanvasElement } from "@/features/canvas/types";
import { useSelector } from "react-redux";
import PositionProperties from "../CommonProperties/PositionProperties";
import ScaleProperties from "../CommonProperties/ScaleProperties";
import SelectInput from "@/components/ui/controlled-inputs/SelectInput";
import { TextInput } from "@/components/ui/controlled-inputs/TextInput";
import { LuRadius } from "react-icons/lu";

export function ImageProperties({ element }: { element: CanvasElement }) {
  const dispatch = useAppDispatch();
  const elements = useSelector((store: any) => store.canvas.elements);
  const globalFrame = elements.find((f: CanvasElement) => f.id === element.frameId);

  const objectFitMap = {
    fit: "contain",
    fill: "cover",
    stretch: "fill",
  } as const;

  const reverseObjectFitMap = {
    contain: "fit",
    cover: "fill",
    fill: "stretch",
  } as const;

  const handleFitModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFitMode = e.target.value as "fit" | "fill" | "stretch";
    const objectFitValue = objectFitMap[newFitMode];

    const isFrame = element.type === "frame";
    const frame = isFrame
      ? element
      : elements.find((el: CanvasElement) => el.id === element.frameId);

    const imgW = element.originalWidth;
    const imgH = element.originalHeight;

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

      // ✅ تحديث العنصر الحالي (صورة أو فريم)
      dispatch(
        updateElement({
          id: element.id,
          updates: {
            fitMode: newFitMode,
            objectFit: objectFitValue,
            ...(isFrame
              ? {}
              : {
                  x: frame.x + offsetX,
                  y: frame.y + offsetY,
                  width: newWidth,
                  height: newHeight,
                }),
          },
        })
      );

      // ✅ لو ده عنصر جوه فريم، نحدث الفريم كمان
      if (!isFrame && frame) {
        dispatch(
          updateElement({
            id: frame.id,
            updates: {
              fitMode: newFitMode,
              objectFit: objectFitValue,
            },
          })
        );
      }
    } else {
      // حالة بدون frame
      dispatch(
        updateElement({
          id: element.id,
          updates: {
            fitMode: newFitMode,
            objectFit: objectFitValue,
          },
        })
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Common Shape Properties */}
      <PositionProperties element={element} />
      <ScaleProperties element={element} />
      <TextInput
        label={<LuRadius />}
        type="number"
        value={globalFrame?.borderRadiusSpecial ?? 0}
        // onChange={(val) => updateElement({ borderRadius: Number(val) })}
        onChange={(val) =>
          dispatch(updateElement({
            id: globalFrame.id,
            updates: { borderRadiusSpecial: Math.max(0, Number(val)) }
          }))
        }
      />

      {globalFrame && (
        <SelectInput
          label="Image Fit Mode"
          value={
            reverseObjectFitMap[element.objectFit as keyof typeof reverseObjectFitMap] || "fill"
          }
          options={["fill", "fit", "stretch"]}
          onChange={(val) =>
            handleFitModeChange({
              target: { value: val },
            } as React.ChangeEvent<HTMLSelectElement>)
          }
        />
      )}


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
