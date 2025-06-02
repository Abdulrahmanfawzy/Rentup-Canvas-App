import { TextInput } from "@/components/ui/controlled-inputs/TextInput";
import { updateElement } from "@/features/canvas/canvasSlice";
import type { CanvasElement } from "@/features/canvas/types";
import { useAppDispatch } from "@/hooks/useRedux";
import { FaX, FaY } from "react-icons/fa6";

export default function PositionProperties({
  element,
}: {
  element: CanvasElement;
}) {
  const dispatch = useAppDispatch();
  const update = <T extends CanvasElement>(updates: Partial<T>) => {
    dispatch(updateElement({ id: element.id, updates }));
  };
  return (
    <>
      <h4 className="mb-2">Position</h4>
      <div className="flex gap-4">
        <TextInput
          label={<FaX />}
          type="number"
          id="x"
          value={element.x.toFixed(0)}
          onChange={(val) => update({ x: Number.parseFloat(val) })}
        />
        <TextInput
          label={<FaY />}
          type="number"
          value={element.y.toFixed(0)}
          onChange={(val) => update({ y: Number.parseFloat(val) })}
        />
      </div>
    </>
  );
}
