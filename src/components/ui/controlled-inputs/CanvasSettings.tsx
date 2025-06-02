import { setStageSize } from "../../../features/canvas/canvasSlice";
import { useAppDispatch, useAppSelector } from "../../../hooks/useRedux";
import { TextInput } from "./TextInput";

export function CanvasSettings() {
  const dispatch = useAppDispatch();
  const { stageWidth, stageHeight } = useAppSelector((state) => state.canvas);

  const updateSize = (dimension: "width" | "height", value: string) => {
    const numeric = parseInt(value);
    if (!isNaN(numeric)) {
      dispatch(
        setStageSize({
          width: dimension === "width" ? numeric : stageWidth,
          height: dimension === "height" ? numeric : stageHeight,
        })
      );
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <TextInput label="Canvas Width" type="number" value={stageWidth} onChange={(val) => updateSize("width", val)} />
      <TextInput
        label="Canvas Height"
        type="number"
        value={stageHeight}
        onChange={(val) => updateSize("height", val)}
      />
    </div>
  );
}
