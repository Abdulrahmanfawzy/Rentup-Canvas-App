"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  addColor,
  removeColor,
  setColor,
} from "@/features/branding/brandingSlice";
import { Button } from "../../../ui/Button";
import { TextInput } from "../../../ui/controlled-inputs/TextInput";
import { MdDeleteOutline } from "react-icons/md";
import { ColorInput } from "../../../ui/controlled-inputs/ColorInput";
import { updateElement } from "@/features/canvas/canvasSlice";

export function BrandingPanel() {
  const dispatch = useAppDispatch();
  const colors = useAppSelector((state) => state.branding.colors);
  const fontFamilies = useAppSelector((state) => state.branding.fontFamilies);
  const elements = useAppSelector((state) => state.canvas.elements);

  const [newKey, setNewKey] = useState("");
  const [newColor, setNewColor] = useState("#000000");
  console.log("new");
  const handleAdd = () => {
    if (newKey.trim()) {
      dispatch(addColor({ key: newKey.trim(), value: newColor }));
      setNewKey("");
      setNewColor("#000000");
    }
  };

  const handleUpdate = (key: string, value: string) => {
    dispatch(setColor({ key, value }));
    // Force re-render of all elements that use this branding color
    elements.forEach((element) => {
      if (
        element.fillBrandingType === key ||
        element.strokeBrandingType === key ||
        (element.type === "text" &&
          (element.colorBrandingType === key ||
            element.backgroundBrandingType === key))
      ) {
        // Trigger a small update to force re-render
        dispatch(
          updateElement({
            id: element.id,
            updates: { opacity: element.opacity || 1 },
          })
        );
      }
    });
  };

  const handleDelete = (key: string) => {
    dispatch(removeColor(key));
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold">Branding Colors</h2>

      {/* Template Actions */}
      {/*       <div className="space-y-2 p-3 bg-secondary rounded-md">
        <h3 className="font-semibold text-sm">Template Actions</h3>
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={applyBrandingToAll}
            className="text-xs"
          >
            Apply Branding to All Elements
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetAllBranding}
            className="text-xs"
          >
            Reset All to Fixed Colors
          </Button>
        </div>
      </div> */}

      {/* Existing Colors */}
      <div className="space-y-2">
        {Object.entries(colors).map(([key, value]) => (
          <div key={key} className="flex flex-col w-full shadow gap-2">
            <span className="w-full font-medium">{key}</span>
            <ColorInput
              showOpacity
              value={value}
              onChange={(val) => handleUpdate(key, val)}
            />
            <Button variant="outline" onClick={() => handleDelete(key)}>
              <MdDeleteOutline />
            </Button>
          </div>
        ))}
      </div>

      {/* Add New */}
      <div className="pt-4 border-t">
        <h3 className="font-semibold mb-2">Add New Color</h3>
        <div className="flex flex-col items-center gap-2 mb-3">
          <TextInput
            className="w-full"
            value={newKey}
            placeholder="e.g. highlight"
            onChange={(val) => setNewKey(val)}
          />
          <ColorInput
            showOpacity
            className="w-full"
            value={newColor}
            onChange={(val) => setNewColor(val)}
          />
        </div>
        <Button onClick={handleAdd}>Add New Color Branding</Button>
      </div>

      {/* Existing Fonts */}
      <div className="space-y-2">
        <h3 className="font-semibold">Font Families</h3>
        {Object.entries(fontFamilies).map(([key, value]) => (
          <div key={key} className="flex flex-col w-full shadow gap-2">
            <span className="w-full font-medium">{key}</span>
            <span>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
