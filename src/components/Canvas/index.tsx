import { Stage, Layer, Transformer } from "react-konva";
import { useRef, useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "../../hooks/useRedux";
import {
  deleteSelectedElement,
  selectElement,
  updateElement,
  deselectAllElements,
} from "../../features/canvas/canvasSlice";
import { ElementRenderer } from "../ui/ElementRenderer";

export function Canvas() {
  const [cursor, setCursor] = useState("default");
  const elements = useAppSelector((state) => state.canvas.elements);
  const { stageWidth, stageHeight } = useAppSelector((state) => state.canvas);
  const dispatch = useAppDispatch();
  const selectedNodeRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);

  // Check if any element is selected
  const isAnyElementSelected = elements.some((el) => el.selected);

  useEffect(() => {
    if (
      transformerRef.current &&
      selectedNodeRef.current &&
      isAnyElementSelected
    ) {
      transformerRef.current.nodes([selectedNodeRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    } else if (transformerRef.current) {
      // Clear Transformer nodes when no element is selected
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [elements, isAnyElementSelected]);

  useEffect(() => {
    const handleKeyDown = (e: any) => {
      if (e.key === "Delete") {
        dispatch(deleteSelectedElement());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);

  const handleStageClick = (e: any) => {
    if (e.target === e.target.getStage()) {
      dispatch(deselectAllElements());
    }
  };
  /* handle zooming */
  const stageRef = useRef<any>(null);

  const handleWheel = (e: any) => {
    e.evt.preventDefault();

    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const scaleBy = 1.05;
    const minScale = 1;
    const maxScale = 5;

    let newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    newScale = Math.max(minScale, Math.min(maxScale, newScale));

    stage.scale({ x: newScale, y: newScale });

    let newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    // تقييد السحب
    const stageBox = {
      width: stageWidth * newScale,
      height: stageHeight * newScale,
    };
    const containerWidth = stage.width();
    const containerHeight = stage.height();

    const minX = containerWidth - stageBox.width;
    const minY = containerHeight - stageBox.height;

    newPos.x = Math.min(0, Math.max(minX, newPos.x));
    newPos.y = Math.min(0, Math.max(minY, newPos.y));

    stage.position(newPos);
    stage.batchDraw();
  };

  return (
    <Stage
      ref={stageRef}
      width={stageWidth}
      height={stageHeight}
      style={{ cursor }}
      onMouseDown={handleStageClick}
      onWheel={handleWheel}
      draggable={stageRef.current?.scaleX() > 1}
      dragBoundFunc={(pos) => {
        const stage = stageRef.current;
        const scale = stage.scaleX(); // scale ثابت في X و Y

        const stageBox = {
          width: stageWidth * scale,
          height: stageHeight * scale,
        };

        const containerWidth = stage.width();
        const containerHeight = stage.height();

        const minX = containerWidth - stageBox.width;
        const minY = containerHeight - stageBox.height;

        return {
          x: Math.min(0, Math.max(minX, pos.x)),
          y: Math.min(0, Math.max(minY, pos.y)),
        };
      }}
      onDragStart={() => setCursor("grabbing")}
      onDragEnd={() => setCursor("grab")}
      onMouseEnter={() => {
        if (stageRef.current?.draggable()) setCursor("grab");
      }}
      onMouseLeave={() => setCursor("default")}
    >
      <Layer>
        {elements.map((el) => (
          <ElementRenderer
            key={el.id}
            element={el}
            isSelected={el.selected as boolean}
            onSelect={() => dispatch(selectElement(el.id))}
            onChange={(updates) =>
              dispatch(updateElement({ id: el.id, updates }))
            }
            ref={el.selected ? selectedNodeRef : null}
          />
        ))}
        {isAnyElementSelected && <Transformer ref={transformerRef} />}
      </Layer>
    </Stage>
  );
}
