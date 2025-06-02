import { addElement } from "@/features/canvas/canvasSlice";
import { useAppDispatch } from "@/hooks/useRedux";
import { Button } from "../../../ui/Button";

export function TextPanel() {
  const dispatch = useAppDispatch();

  return (
    <div>
      <Button onClick={() => dispatch(addElement({ type: "text" }))}>
        Add Text
      </Button>
    </div>
  );
}
