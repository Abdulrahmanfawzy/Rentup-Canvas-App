import { TextInput } from "@/components/ui/controlled-inputs/TextInput";
import { updateElement } from "@/features/canvas/canvasSlice";
import type { CanvasElement } from "@/features/canvas/types";
import { useAppDispatch } from "@/hooks/useRedux";
import { MdOutlineScreenRotationAlt } from "react-icons/md";

export default function RotationProperties({
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
      <>
        <h4 className="mb-2">Rotation</h4>
        <div>
          <TextInput
            label={<MdOutlineScreenRotationAlt />}
            type="number"
            value={(element.rotation ?? 0).toFixed(0)}
            onChange={(val) => update({ rotation: Number.parseFloat(val) })}
          />
        </div>
      </>
    </>
  );
}
