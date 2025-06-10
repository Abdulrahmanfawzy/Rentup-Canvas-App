import { useAppDispatch } from "@/hooks/useRedux";
import { updateElement } from "@/features/canvas/canvasSlice";
import type {
    CanvasElement,
  CanvasElementUnion,
} from "@/features/canvas/types";
// import { TextInput } from "@/components/ui/controlled-inputs/TextInput";
import PositionProperties from "../CommonProperties/PositionProperties";
import ScaleProperties from "../CommonProperties/ScaleProperties";
// import RotationProperties from "../CommonProperties/RotationProperties";
import { ColorInput } from "@/components/ui/controlled-inputs/ColorInput";

export function IconProperties({ element }: { element: CanvasElement }) {
  const dispatch = useAppDispatch();

  const update = <T extends CanvasElementUnion>(updates: Partial<T>) => {
    dispatch(updateElement({ id: element.id, updates }));
  };

  return (
    <div className="space-y-4">
      {/* Common Shape Properties */}
      <PositionProperties element={element} />
      <ScaleProperties element={element} />
      {/* <RotationProperties element={element} /> */}
      <div className="space-y-2">
        <ColorInput
            label="Fill"
            value={element.color ?? "#000000"}
            onChange={(val) => update({ color: val })}
        />
      </div>
    </div>
  );
}
