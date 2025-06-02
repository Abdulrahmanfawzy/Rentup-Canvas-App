import SelectInput from "@/components/ui/controlled-inputs/SelectInput";
import { TextInput } from "@/components/ui/controlled-inputs/TextInput";
import { setElements, setStageSize } from "@/features/canvas/canvasSlice";
import type { AspectRatio } from "@/features/canvas/types";
import { useAspectRatioChange } from "@/hooks/useAspectRatioChange";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { rescaleElementsForAspectRatio } from "@/utils/aspectRatioRescale";
import { useState } from "react";
import { FaH, FaW } from "react-icons/fa6";

export default function CanvasProperties() {
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const changeAspectRatio = useAspectRatioChange();
  const dispatch = useAppDispatch();
  const { stageWidth, stageHeight } = useAppSelector((state) => state.canvas);
  const elements = useAppSelector((s) => s.canvas.elements);

  // const updateSize = (dimension: "width" | "height", value: string) => {
  //   const numeric = parseInt(value);
  //   if (!isNaN(numeric)) {
  //     dispatch(
  //       setStageSize({
  //         width: dimension === "width" ? numeric : stageWidth,
  //         height: dimension === "height" ? numeric : stageHeight,
  //       })
  //     );

      
  //   }
  // };


  const updateSize = (dimension: "width" | "height", value: string) => {
  const numeric = parseInt(value);
  if (!isNaN(numeric)) {
    const oldWidth = stageWidth;
    const oldHeight = stageHeight;

    const newWidth = dimension === "width" ? numeric : stageWidth;
    const newHeight = dimension === "height" ? numeric : stageHeight;

    // أول حاجة نعمل scale للأشكال بناء على الفرق
    const scaledElements = rescaleElementsForAspectRatio(
      elements,
      { width: oldWidth, height: oldHeight },
      { width: newWidth, height: newHeight }
    );

    // بعدين نحدث العناصر
    dispatch(setElements(scaledElements));

    // وأخيرًا نحدث حجم الكانفس
    dispatch(setStageSize({ width: newWidth, height: newHeight }));
  }
};



  const ASPICT_RATIO = ["1:1", "9:16"] as const;
  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        <h3 className="col-span-full font-medium text-sm">Canvas Size</h3>
        <TextInput
          label={<FaW />}
          type="number"
          value={stageWidth}
          onChange={(val) => updateSize("width", val)}
        />
        <TextInput
          label={<FaH />}
          type="number"
          value={stageHeight}
          onChange={(val) => updateSize("height", val)}
        />
      </div>
      <div className="flex flex-col gap-2 mt-4">
        <SelectInput
          isClearable={false}
          label="Aspect ratio"
          value={aspectRatio}
          onChange={(val) => {
            setAspectRatio(val as AspectRatio);
            changeAspectRatio(val as AspectRatio);
          }}
          options={Array.from(ASPICT_RATIO)}
        />
      </div>
    </div>
  );
}
