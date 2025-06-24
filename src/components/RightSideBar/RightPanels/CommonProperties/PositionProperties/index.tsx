import { TextInput } from "@/components/ui/controlled-inputs/TextInput";
import { updateElement } from "@/features/canvas/canvasSlice";
import type { CanvasElement } from "@/features/canvas/types";
import { usePercentConverter } from "@/hooks/usePercentConverter";
import { useAppDispatch } from "@/hooks/useRedux";
import { FaX, FaY } from "react-icons/fa6";
import { useSelector } from "react-redux";

export default function PositionProperties({
  element,
}: {
  element: CanvasElement;
}) {
  const dispatch = useAppDispatch();
  const update = <T extends CanvasElement>(updates: Partial<T>) => {
    dispatch(updateElement({ id: element.id, updates }));
  };
  const { toPercent } = usePercentConverter();
  const stageWidth = useSelector((state: any) => state.canvas.stageWidth);
  const stageHeight = useSelector((state: any) => state.canvas.stageHeight);
  return (
    <>
      <h4 className="mb-2">Position</h4>
      <div className="flex gap-4">
        <TextInput
          label={<FaX />}
          type="number"
          id="x"
          value={element.x.toFixed(0)}
          onChange={(val) =>
            update({
              x: Number(val),
              x_percent: toPercent(Number(val), stageWidth),
            })
          }
        />
        <TextInput
          label={<FaY />}
          type="number"
          value={element.y.toFixed(0)}
          onChange={(val) =>
            update({
              y: Number(val),
              y_percent: toPercent(Number(val), stageHeight),
            })
          }
        />
      </div>
    </>
  );
}
