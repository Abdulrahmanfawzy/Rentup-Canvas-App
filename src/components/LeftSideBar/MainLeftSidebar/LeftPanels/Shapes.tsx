import {
  FaCircle,
  FaSquare,
  FaShapes,
  FaStar,
  FaRing,
  FaEllipsisH,
} from "react-icons/fa";
import { GiTriangleTarget } from "react-icons/gi";
import { BsSlashLg } from "react-icons/bs";
import { useAppDispatch } from "@/hooks/useRedux";
import { addElement } from "@/features/canvas/canvasSlice";
import { Button } from "../../../ui/Button";

export function ShapesPanel() {
  const dispatch = useAppDispatch();

  const shapes = [
    { type: "circle", label: "Circle", icon: FaCircle },
    { type: "rectangle", label: "Rectangle", icon: FaSquare },
    { type: "triangle", label: "Triangle", icon: GiTriangleTarget },
    { type: "ellipse", label: "Ellipse", icon: FaEllipsisH },
    { type: "line", label: "Line", icon: BsSlashLg },
    { type: "star", label: "Star", icon: FaStar },
    { type: "ring", label: "Ring", icon: FaRing },
    { type: "wedge", label: "Wedge", icon: FaShapes },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {shapes.map((shape) => (
        <Button
          key={shape.type}
          variant={"outline"}
          className="flex flex-col items-center justify-center p-2 h-auto aspect-square"
          onClick={() => dispatch(addElement({ type: shape.type as any }))}
          title={`Add ${shape.label}`}
        >
          <shape.icon className="h-6 w-6 mb-1" />
          <span className="text-xs">{shape.label}</span>
        </Button>
      ))}
    </div>
  );
}
