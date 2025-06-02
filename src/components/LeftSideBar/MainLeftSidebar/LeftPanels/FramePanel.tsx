import { Button } from "@/components/ui/Button";
import { addElement } from "@/features/canvas/canvasSlice";
import { useAppDispatch } from "@/hooks/useRedux";
import { LuFrame } from "react-icons/lu";

export function FramePanel() {
  const dispatch = useAppDispatch();

  return (
    <div>
      <Button
          variant={"outline"}
          className="flex flex-col items-center justify-center w-20 p-3 h-auto aspect-square"
          onClick={() => dispatch(addElement({ type: "frame" }))}
          title={`Add Frame`}>
          <LuFrame />
          <span className="text-xs">Frame</span>
      </Button>
    </div>
  );
}