import { FaUndo, FaRedo } from "react-icons/fa";
import { undo, redo } from "@/features/canvas/canvasSlice";
import { Button } from "../../ui/Button";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";

export function HistoryControls() {
  const dispatch = useAppDispatch();
  const past = useAppSelector((state) => state.canvas.past);
  const future = useAppSelector((state) => state.canvas.future);

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        disabled={past.length === 0}
        onClick={() => dispatch(undo())}
      >
        <FaUndo className="mr-2" />
        <span>Undo</span>
      </Button>

      <Button
        className="flex items-center justify-center gap-2"
        variant="outline"
        disabled={future.length === 0}
        onClick={() => dispatch(redo())}
      >
        <FaRedo className="mr-2" />
        <span>Redo</span>
      </Button>
    </div>
  );
}
