import { moveElementDown, moveElementUp, selectElement } from "@/features/canvas/canvasSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { HiChevronUp, HiChevronDown, HiChevronRight } from "react-icons/hi";
import { useState } from "react";
import type { CanvasElement } from "@/features/canvas/types";

export function LayerPanel() {
  const elements = useAppSelector((state) => state.canvas.elements);
  const dispatch = useAppDispatch();
  const [expandedFrames, setExpandedFrames] = useState({});

  const toggleFrame = (frameId: string) => {
    setExpandedFrames((prev: Record<string, boolean>) => ({
      ...prev,
      [frameId]: prev[frameId] === undefined ? false : !prev[frameId],
    }));
  };

  // فلتر الـ elements عشان نعرض بس الـ top-level layers (اللي مش عندهم frameId)
  const topLevelElements = elements.filter((el) => !el.frameId);

  const renderLayer = (el:CanvasElement) => {
    const children = elements.filter((child) => child.frameId === el.id);
    const isExpanded = (expandedFrames as Record<string, boolean>)[el.id] ?? false;

    return (
      <div key={el.id}>
        <div
          className={`flex justify-between items-center p-2 border rounded cursor-pointer ${
            el.selected ? "bg-primary" : "bg-secondary"
          }`}
          onClick={() => dispatch(selectElement(el.id))}
        >
          <div className="flex items-center space-x-2">
            {children.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFrame(el.id);
                }}
              >
                {isExpanded ? (
                  <HiChevronDown color="gray" size={20} />
                ) : (
                  <HiChevronRight color="gray" size={20} />
                )}
              </button>
            )}
            <span className={`${el.selected ? "text-secondary" : "text-primary"}`}>
              {el.type} {children.length > 0 ? `(+${children.length} child)` : ""}
            </span>
          </div>
          <div className="space-x-1 flex">
            <button
              onClick={(e) => {
                e.stopPropagation();
                dispatch(moveElementUp(el.id));
              }}
            >
              <HiChevronUp color="gray" size={32} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                dispatch(moveElementDown(el.id));
              }}
            >
              <HiChevronDown color="gray" size={32} />
            </button>
          </div>
        </div>
        {/* عرض الـ children لو الفريم مفتوح وفيه children */}
        {isExpanded &&
          children.map((child) => (
            <div
              key={child.id}
              className={`flex justify-between items-center p-2 border rounded cursor-pointer ${
                child.selected ? "bg-primary" : "bg-secondary"
              }`}
              style={{ marginLeft: "20px" }} // Indentation للـ child
              onClick={() => dispatch(selectElement(child.id))}
            >
              <span className={`${child.selected ? "text-secondary" : "text-primary"}`}>
                {child.type}
              </span>
              {/* لو عايز تضيف أزرار للـ child (زي إزالة من الفريم)، حطها هنا */}
            </div>
          ))}
      </div>
    );
  };

  return (
    <div className="p-4 shadow space-y-2">
      {[...topLevelElements].reverse().map((el) => renderLayer(el))}
    </div>
  );
}