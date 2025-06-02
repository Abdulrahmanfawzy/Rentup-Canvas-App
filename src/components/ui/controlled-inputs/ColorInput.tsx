import { cn } from "@/utils/clsxUtils";
import type React from "react";

import { useState, useEffect, useRef } from "react";
import tinycolor from "tinycolor2";

interface ColorInputProps {
  label?: string;
  value: string; // هتبقى rgba أو hex
  opacity?: number; // لو موجود
  onChange: (val: string, opacity?: number) => void;
  className?: string;
  showOpacity?: boolean;
}

export function ColorInput({
  label,
  value,
  // opacity = 100,
  onChange,
  className,
  showOpacity = false,
}: ColorInputProps) {
  // تخزين لون الـ hex والشفافية داخل ال states
  const [hexValue, setHexValue] = useState("#000000");
  const [opacityValue, setOpacityValue] = useState(100);

  const colorPickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const color = tinycolor(value);
    setHexValue(color.toHexString());

    const alpha = Math.round(color.getAlpha() * 100);
    setOpacityValue(isNaN(alpha) ? 100 : alpha);
  }, [value]);

  // لما المستخدم يغير اللون (hex)
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value;
    setHexValue(newHex);

    // نحول للـ rgba مع الشفافية الحالية
    const rgba = tinycolor(newHex)
      .setAlpha(opacityValue / 100)
      .toRgbString();

    onChange(rgba, opacityValue);
  };

  // لما المستخدم يغير الشفافية
  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOpacity = Number.parseInt(e.target.value);
    setOpacityValue(newOpacity);

    // نحول للـ rgba مع اللون الحالي والشفافية الجديدة
    const rgba = tinycolor(hexValue)
      .setAlpha(newOpacity / 100)
      .toRgbString();

    onChange(rgba, newOpacity);
  };

  // لما المستخدم يختار اللون من color picker
  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value;
    setHexValue(newHex);

    const rgba = tinycolor(newHex)
      .setAlpha(opacityValue / 100)
      .toRgbString();

    onChange(rgba, opacityValue);
  };

  return (
    <div className={cn("flex flex-col", className)}>
      {label && <label className="text-sm font-medium mb-1">{label}</label>}
      <div className="flex items-center  bg-secondary text-secondary-foreground rounded-sm  overflow-hidden">
        <div className="flex items-center flex-1">
          <div
            className="w-4 h-4 ml-2 rounded-sm cursor-pointer"
            style={{ backgroundColor: hexValue }}
            onClick={() => colorPickerRef.current?.click()}
          />
          <input
            type="text"
            value={hexValue.toUpperCase()}
            onChange={handleHexChange}
            className="bg-transparent text-xs px-2 py-1 w-20 focus:outline-none"
          />
        </div>
        {showOpacity && (
          <div className="flex items-center pr-2">
            <input
              type="number"
              min={0}
              max={100}
              value={opacityValue}
              onChange={handleOpacityChange}
              className="bg-transparent text-xs w-8 text-right focus:outline-none no-spinner"
            />
            <span className="text-xs ml-1">%</span>
          </div>
        )}
        <input
          type="color"
          value={hexValue}
          onChange={handleColorPickerChange}
          className="sr-only"
          id="color-picker"
          ref={colorPickerRef}
        />
      </div>
    </div>
  );
}
