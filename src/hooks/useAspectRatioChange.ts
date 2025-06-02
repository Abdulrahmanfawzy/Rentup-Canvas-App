import { setStageSize, setAspectRatio, setElements } from "../features/canvas/canvasSlice";
import { rescaleElementsForAspectRatio } from "../utils/aspectRatioRescale";
import { useAppDispatch, useAppSelector } from "./useRedux";
import type { AspectRatio } from "../features/canvas/types";

export function useAspectRatioChange() {
  const dispatch = useAppDispatch();
  const elements = useAppSelector((s) => s.canvas.elements);
  const stageWidth = useAppSelector((s) => s.canvas.stageWidth);
  const stageHeight = useAppSelector((s) => s.canvas.stageHeight);

  return (value: AspectRatio) => {
    const aspectRatios: Record<AspectRatio, number> = {
      "1:1": 1,
      "9:16": 9 / 16,
    };

    const newWidth = 1000;
    const newHeight = Math.round(newWidth / aspectRatios[value]);
    
    const scaledElements = rescaleElementsForAspectRatio(
      elements,
      { width: stageWidth, height: stageHeight },
      { width: newWidth, height: newHeight }
    );

    dispatch(setStageSize({ width: newWidth, height: newHeight }));
    dispatch(setElements(scaledElements));
    dispatch(setAspectRatio(value));
  };
}
