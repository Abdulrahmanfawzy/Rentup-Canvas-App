import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./useRedux";
import {
  deleteSelectedElement,
  undo,
  redo,
  selectElement,
  addElement,
  deselectAllElements,
} from "@/features/canvas/canvasSlice";
import { useCanvas } from "@/context/CanvasContext";
import { updateElement } from "@/features/canvas/canvasSlice";

export function useKeyboardShortcuts() {
  const dispatch = useAppDispatch();
  const elements = useAppSelector((state) => state.canvas.elements);
  const selectedElement = elements.find((el) => el.selected);
  const { handleExportPNG, handleExportJSON } = useCanvas();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcuts when typing in input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const isCtrl = e.ctrlKey || e.metaKey; // Support both Ctrl and Cmd
      const isShift = e.shiftKey;
      const isAlt = e.altKey;

      // Basic shortcuts
      switch (e.key.toLowerCase()) {
        // Delete selected element
        case "delete":
        case "backspace":
          if (selectedElement) {
            e.preventDefault();
            dispatch(deleteSelectedElement());
          }
          break;

        // Escape - deselect all
        case "escape":
          e.preventDefault();
          dispatch(deselectAllElements());
          break;

        // Copy (Ctrl+C)
        case "c":
          if (isCtrl && selectedElement) {
            e.preventDefault();
            // Store in localStorage for simple copy functionality
            localStorage.setItem(
              "copiedElement",
              JSON.stringify(selectedElement)
            );
          }
          break;

        // Paste (Ctrl+V)
        case "v":
          if (isCtrl) {
            e.preventDefault();
            const copiedElement = localStorage.getItem("copiedElement");
            if (copiedElement) {
              try {
                const element = JSON.parse(copiedElement);
                // Create a copy with new position
                dispatch(
                  addElement({
                    type: element.type,
                    ...(element.type === "text" && { text: element.text }),
                    ...(element.type === "icon" && {
                      iconName: element.iconName,
                    }),
                  })
                );
              } catch (error) {
                console.error("Failed to paste element:", error);
              }
            }
          }
          break;

        // Undo (Ctrl+Z)
        case "z":
          if (isCtrl && !isShift) {
            e.preventDefault();
            dispatch(undo());
          }
          // Redo (Ctrl+Shift+Z)
          else if (isCtrl && isShift) {
            e.preventDefault();
            dispatch(redo());
          }
          break;

        // Redo (Ctrl+Y)
        case "y":
          if (isCtrl) {
            e.preventDefault();
            dispatch(redo());
          }
          break;

        // Select All (Ctrl+A)
        case "a":
          if (isCtrl) {
            e.preventDefault();
            // Select the first element if none selected
            if (elements.length > 0 && !selectedElement) {
              dispatch(selectElement(elements[0].id));
            }
          }
          break;

        // Export as PNG (Ctrl+E)
        case "e":
          if (isCtrl) {
            e.preventDefault();
            handleExportPNG();
          }
          break;

        // Save as JSON (Ctrl+S)
        case "s":
          if (isCtrl) {
            e.preventDefault();
            handleExportJSON();
          }
          break;

        // Quick add shapes
        case "r":
          if (!isCtrl && !isAlt && !isShift) {
            e.preventDefault();
            dispatch(addElement({ type: "rectangle" }));
          }
          break;

        case "o":
          if (!isCtrl && !isAlt && !isShift) {
            e.preventDefault();
            dispatch(addElement({ type: "circle" }));
          }
          break;

        case "t":
          if (!isCtrl && !isAlt && !isShift) {
            e.preventDefault();
            dispatch(addElement({ type: "text", text: "New Text" }));
          }
          break;

        case "f":
          if (!isCtrl && !isAlt && !isShift) {
            e.preventDefault();
            dispatch(addElement({ type: "frame" }));
          }
          break;

        // Arrow keys for moving selected element
        case "arrowup":
          if (selectedElement) {
            e.preventDefault();
            const step = isShift ? 10 : 1;
            dispatch(
              updateElement({
                id: selectedElement.id,
                updates: { y: selectedElement.y - step },
              })
            );
          }
          break;

        case "arrowdown":
          if (selectedElement) {
            e.preventDefault();
            const step = isShift ? 10 : 1;
            dispatch(
              updateElement({
                id: selectedElement.id,
                updates: { y: selectedElement.y + step },
              })
            );
          }
          break;

        case "arrowleft":
          if (selectedElement) {
            e.preventDefault();
            const step = isShift ? 10 : 1;
            dispatch(
              updateElement({
                id: selectedElement.id,
                updates: { x: selectedElement.x - step },
              })
            );
          }
          break;

        case "arrowright":
          if (selectedElement) {
            e.preventDefault();
            const step = isShift ? 10 : 1;
            dispatch(
              updateElement({
                id: selectedElement.id,
                updates: { x: selectedElement.x + step },
              })
            );
          }
          break;
      }
    };

    // Add event listener
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dispatch, selectedElement, elements, handleExportPNG, handleExportJSON]);
}
