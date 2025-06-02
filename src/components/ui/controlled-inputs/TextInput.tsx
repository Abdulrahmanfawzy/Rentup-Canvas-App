import { cn } from "@/utils/clsxUtils";
import type React from "react";
import { forwardRef } from "react";

export interface TextInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "value"
  > {
  label?: string | React.ReactNode;
  prefix?: string;
  value?: string | number;
  onChange?: (val: string) => void;
  type?: "text" | "number" | "email" | "password" | "tel" | "url";
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      label,
      prefix,
      value,
      onChange,
      type = "text",
      className,
      inputClassName,
      labelClassName,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn("flex flex-col", className)}>
        <div className="flex items-center bg-secondary text-secondary-foreground rounded-sm overflow-hidden">
          {label && (
            <label
              htmlFor={props.id || props.name}
              className={cn("text-xs px-2", labelClassName)}
            >
              {label}
            </label>
          )}
          <input
            ref={ref}
            type={type}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            className={cn(
              "w-full bg-transparent text-sm py-1 px-2 focus:outline-none no-spinner",
              inputClassName
            )}
            {...props}
          />
        </div>
      </div>
    );
  }
);

TextInput.displayName = "TextInput";
