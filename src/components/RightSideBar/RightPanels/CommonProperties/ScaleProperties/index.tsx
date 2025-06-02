import { TextInput } from "@/components/ui/controlled-inputs/TextInput";
import { updateElement } from "@/features/canvas/canvasSlice";
import type { CanvasElement } from "@/features/canvas/types";
import { useAppDispatch } from "@/hooks/useRedux";
import { FaH, FaW } from "react-icons/fa6";

export default function ScaleProperties({
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
      <h4 className="mb-2">Scale</h4>
      <div className="flex gap-4">
        <TextInput
          label={<FaW />}
          type="number"
          value={element.width.toFixed(0)}
          onChange={(val) => update({ width: Number.parseFloat(val) })}
        />
        <TextInput
          label={<FaH />}
          type="number"
          value={element.height.toFixed(0)}
          onChange={(val) => update({ height: Number.parseFloat(val) })}
        />
      </div>
    </>
  );
}
