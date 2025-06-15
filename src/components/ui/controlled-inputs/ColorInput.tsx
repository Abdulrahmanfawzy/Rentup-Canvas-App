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
  disabled?: boolean; // Added disabled prop
}

export function ColorInput({
  label,
  value,
  onChange,
  className,
  showOpacity = false,
  disabled = false, // Default to false
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
    if (disabled) return; // Prevent changes when disabled
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
    if (disabled) return; // Prevent changes when disabled
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
    if (disabled) return; // Prevent changes when disabled
    const newHex = e.target.value;
    setHexValue(newHex);

    const rgba = tinycolor(newHex)
      .setAlpha(opacityValue / 100)
      .toRgbString();

    onChange(rgba, opacityValue);
  };

  // Handle click on color preview
  const handleColorPreviewClick = () => {
    if (!disabled) {
      colorPickerRef.current?.click();
    }
  };

  return (
    <div className={cn("flex flex-col", className, { "opacity-50": disabled })}>
      {label && (
        <label
          className={cn("text-sm font-medium mb-1", {
            "text-muted-foreground": disabled,
          })}
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          "flex items-center bg-secondary text-secondary-foreground rounded-sm overflow-hidden",
          { "cursor-not-allowed": disabled }
        )}
      >
        <div className="flex items-center flex-1">
          <div
            className={cn("w-4 h-4 ml-2 rounded-sm", {
              "cursor-pointer": !disabled,
              "cursor-not-allowed": disabled,
            })}
            style={{ backgroundColor: hexValue }}
            onClick={handleColorPreviewClick}
          />
          <input
            type="text"
            value={hexValue.toUpperCase()}
            onChange={handleHexChange}
            className={cn(
              "bg-transparent text-xs px-2 py-1 w-20 focus:outline-none",
              { "cursor-not-allowed text-muted-foreground": disabled }
            )}
            disabled={disabled} // Native disabled attribute
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
              className={cn(
                "bg-transparent text-xs w-8 text-right focus:outline-none no-spinner",
                { "cursor-not-allowed text-muted-foreground": disabled }
              )}
              disabled={disabled} // Native disabled attribute
            />
            <span
              className={cn("text-xs ml-1", {
                "text-muted-foreground": disabled,
              })}
            >
              %
            </span>
          </div>
        )}
        <input
          type="color"
          value={hexValue}
          onChange={handleColorPickerChange}
          className="sr-only"
          id="color-picker"
          ref={colorPickerRef}
          disabled={disabled} // Native disabled attribute
        />
      </div>
    </div>
  );
}
