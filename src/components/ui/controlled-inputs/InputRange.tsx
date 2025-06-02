import { cn } from "@/utils/clsxUtils";
import type React from "react";
import { useState, useEffect } from "react";

interface InputRangeProps {
  label?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (val: number) => void;
  showValue?: boolean;
  valueFormat?: (value: number) => string;
  className?: string;
  trackClassName?: string;
  thumbClassName?: string;
}

export const InputRange: React.FC<InputRangeProps> = ({
  label,
  value,
  min = 0,
  max = 1,
  step = 0.01,
  onChange,
  showValue = true,
  valueFormat,
  className,
  trackClassName,
  thumbClassName,
}) => {
  const [currentValue, setCurrentValue] = useState(value);

  // Update internal state when props change
  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number.parseFloat(e.target.value);
    setCurrentValue(newValue);
    onChange(newValue);
  };

  const percentage = ((currentValue - min) / (max - min)) * 100;

  const defaultValueFormat = (val: number) => {
    if (max === 1 && min === 0) {
      return `${Math.round(val * 100)}%`;
    }
    return val.toString();
  };

  const formattedValue = valueFormat
    ? valueFormat(currentValue)
    : defaultValueFormat(currentValue);

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center">
          {label && <span className="text-sm font-medium">{label}</span>}
          {showValue && (
            <span className="text-xs font-medium">{formattedValue}</span>
          )}
        </div>
      )}
      <div className="relative h-8 flex items-center">
        <div
          className={cn(
            "absolute h-1 bg-secondary rounded-full w-full overflow-hidden",
            trackClassName
          )}
        >
          <div
            className="absolute h-full bg-primary rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={handleChange}
          className={cn("absolute w-full h-8 opacity-0 cursor-pointer z-10")}
        />
        <div
          className={cn(
            "absolute h-4 w-4 rounded-full bg-primary border-2 border-background shadow-md transform -translate-y-0 pointer-events-none",
            thumbClassName
          )}
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>
    </div>
  );
};
