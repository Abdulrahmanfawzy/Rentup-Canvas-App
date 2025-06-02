import { useState, useEffect, useMemo, useCallback, memo, useRef } from "react";
import { ChevronDown, X } from "lucide-react";
import Select, {
  type MultiValue,
  type SingleValue,
  type StylesConfig,
  components,
  type DropdownIndicatorProps,
  type ClearIndicatorProps,
} from "react-select";
import CreatableSelect from "react-select/creatable";
import { cn } from "@/utils/clsxUtils";

// Define a generic OptionType to allow any object shape
export type OptionType = Record<string, any>;

// Define component props
export interface EnhancedSelectInputProps {
  label?: string;
  value: string | string[];
  onChange: (val: string | string[]) => void;
  options: OptionType[] | string[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  selectClassName?: string;
  labelClassName?: string;
  isMulti?: boolean;
  isSearchable?: boolean;
  isClearable?: boolean;
  closeMenuOnSelect?: boolean;
  maxMenuHeight?: number;
  creatable?: boolean;
  isLoading?: boolean;
  error?: string | null;
  valueKey?: string;
  labelKey?: string;
}

// Custom dropdown indicator component
const DropdownIndicator = (
  props: DropdownIndicatorProps<OptionType, boolean>
) => {
  return (
    <components.DropdownIndicator {...props}>
      <ChevronDown className="h-4 w-4 text-muted-foreground" />
    </components.DropdownIndicator>
  );
};

// Custom clear indicator component
const ClearIndicator = (props: ClearIndicatorProps<OptionType, boolean>) => {
  return (
    <components.ClearIndicator {...props}>
      <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
    </components.ClearIndicator>
  );
};

// Custom loading indicator component
const LoadingIndicator = () => (
  <div className="flex items-center justify-center px-2">
    <svg
      className="h-4 w-4 animate-spin text-muted-foreground"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
      ></path>
    </svg>
  </div>
);

// Move custom styles outside the component to prevent recalculation
const getCustomStyles = (
  maxMenuHeight: number,
  isMulti: boolean,
  error: string | null
): StylesConfig<OptionType, boolean> => ({
  control: (provided, state) => ({
    ...provided,
    minHeight: "32px",
    height: isMulti ? "auto" : "32px",
    fontSize: "14px",
    borderRadius: "6px",
    borderColor: error
      ? "hsl(var(--destructive))"
      : state.isFocused
      ? "hsl(var(--ring))"
      : "hsl(var(--border))",
    backgroundColor: state.isDisabled
      ? "hsl(var(--muted) / 0.5)"
      : "hsl(var(--background))",
    boxShadow: error
      ? "0 0 0 2px hsl(var(--destructive) / 0.2)"
      : state.isFocused
      ? "0 0 0 2px hsl(var(--ring) / 0.2)"
      : "none",
    "&:hover": {
      borderColor: error ? "hsl(var(--destructive))" : "hsl(var(--border))",
    },
    padding: isMulti ? "2px 0" : "0",
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: "0 8px",
    flexWrap: "wrap",
    gap: "4px",
    maxHeight: isMulti ? "120px" : "30px",
    overflowY: isMulti ? "auto" : "hidden",
    alignItems: "center",
    scrollbarWidth: "thin",
    "&::-webkit-scrollbar": {
      width: "4px",
    },
    "&::-webkit-scrollbar-track": {
      background: "transparent",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "hsl(var(--muted))",
      borderRadius: "2px",
    },
  }),
  input: (provided) => ({
    ...provided,
    margin: "0",
    padding: "0",
    color: "hsl(var(--foreground))",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    height: "30px",
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "var(--card)",
    border: "1px solid hsl(var(--border))",
    borderRadius: "6px",
    boxShadow:
      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    zIndex: 50,
  }),
  menuList: (provided) => ({
    ...provided,
    padding: "4px",
    maxHeight: maxMenuHeight,
    backgroundColor: "hsl(var(--card))",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "hsl(var(--accent))"
      : state.isFocused
      ? "hsl(var(--accent) / 0.5)"
      : "transparent",
    color: state.isSelected
      ? "hsl(var(--accent-foreground))"
      : "hsl(var(--foreground))",
    padding: "8px 12px",
    borderRadius: "4px",
    margin: "1px 0",
    cursor: "pointer",
    fontSize: "14px",
    "&:active": {
      backgroundColor: "hsl(var(--accent))",
    },
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "hsl(var(--muted-foreground))",
    fontSize: "14px",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "hsl(var(--foreground))",
    fontSize: "14px",
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: "hsl(var(--secondary))",
    borderRadius: "4px",
    fontSize: "12px",
    margin: "0",
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: "hsl(var(--secondary-foreground))",
    padding: "2px 6px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "150px",
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: "hsl(var(--secondary-foreground))",
    padding: "0 4px",
    "&:hover": {
      backgroundColor: "hsl(var(--destructive))",
      color: "hsl(var(--destructive-foreground))",
    },
  }),
  noOptionsMessage: (provided) => ({
    ...provided,
    color: "hsl(var(--muted-foreground))",
    fontSize: "14px",
  }),
});

const SelectInput = memo(
  ({
    label,
    value,
    onChange,
    options,
    placeholder = "Select...",
    disabled = false,
    className,
    selectClassName,
    labelClassName,
    isMulti = false,
    isSearchable = true,
    isClearable = true,
    closeMenuOnSelect = true,
    maxMenuHeight = 200,
    creatable = false,
    isLoading = false,
    error = null,
    valueKey = "value",
    labelKey = "label",
  }: EnhancedSelectInputProps) => {
    const [currentValue, setCurrentValue] = useState<
      OptionType | OptionType[] | null
    >(null);
    const prevValueRef = useRef<string | string[] | null>(null);

    // Normalize options to always be OptionType[] format with dynamic valueKey and labelKey
    const normalizedOptions = useMemo<OptionType[]>(() => {
      return options.map((option) => {
        if (typeof option === "string") {
          return { [valueKey]: option, [labelKey]: option };
        }
        // Ensure the option has the required keys, fallback to string if missing
        const value = option[valueKey] ?? option.value ?? String(option);
        const label = option[labelKey] ?? option.label ?? String(option);
        return { ...option, [valueKey]: value, [labelKey]: label };
      });
    }, [options, valueKey, labelKey]);

    // Update internal state when props change
    useEffect(() => {
      if (JSON.stringify(value) !== JSON.stringify(prevValueRef.current)) {
        if (isMulti) {
          const values = Array.isArray(value) ? value : [value].filter(Boolean);
          const selectedOptions = values.map((val) => {
            const existingOption = normalizedOptions.find(
              (opt) => opt[valueKey] === val
            );
            return existingOption || { [valueKey]: val, [labelKey]: val };
          });
          setCurrentValue(selectedOptions);
        } else {
          const selectedOption =
            normalizedOptions.find((option) => option[valueKey] === value) ||
            null;
          setCurrentValue(selectedOption);
        }
        prevValueRef.current = value;
      }
    }, [value, normalizedOptions, isMulti, valueKey, labelKey]);

    // Memoized change handler
    const handleChange = useCallback(
      (newValue: MultiValue<OptionType> | SingleValue<OptionType>) => {
        console.log("SelectInput handleChange newValue:", newValue); // Debug log
        if (isMulti) {
          const multiValue = newValue as MultiValue<OptionType>;
          const values = multiValue
            ? multiValue
                .map((option) => option[valueKey] ?? option.value)
                .filter((val): val is string => Boolean(val))
            : [];
          setCurrentValue(multiValue ? [...multiValue] : []);
          onChange(values);
        } else {
          const singleValue = newValue as SingleValue<OptionType>;
          setCurrentValue(singleValue);
          onChange(
            singleValue ? singleValue[valueKey] ?? singleValue.value : ""
          );
        }
      },
      [isMulti, onChange, valueKey]
    );

    // Use memoized custom styles
    const customStyles = useMemo(
      () => getCustomStyles(maxMenuHeight, isMulti, error),
      [maxMenuHeight, isMulti, error]
    );

    const SelectComponent = creatable ? CreatableSelect : Select;

    return (
      <div className={cn("flex flex-col space-y-2", className)}>
        {label && (
          <label
            className={cn(
              "text-sm font-medium text-foreground",
              error && "text-destructive",
              labelClassName
            )}
          >
            {label}
          </label>
        )}
        <div className={cn("relative", selectClassName)}>
          <SelectComponent
            value={currentValue}
            onChange={handleChange}
            options={normalizedOptions}
            getOptionValue={(option) => option[valueKey] ?? option.value}
            getOptionLabel={(option) => option[labelKey] ?? option.label}
            isMulti={isMulti}
            isSearchable={isSearchable}
            isClearable={isClearable}
            isDisabled={disabled || isLoading}
            placeholder={isLoading ? "Loading..." : placeholder}
            closeMenuOnSelect={closeMenuOnSelect && !isMulti}
            styles={customStyles}
            components={{
              DropdownIndicator: isLoading ? () => null : DropdownIndicator,
              ClearIndicator,
              LoadingIndicator,
            }}
            isLoading={isLoading}
            classNamePrefix="react-select"
            noOptionsMessage={() =>
              isLoading ? "Loading options..." : "No options found"
            }
            menuPlacement="auto"
            menuPortalTarget={
              typeof document !== "undefined" ? document.body : null
            }
            menuPosition="fixed"
          />
        </div>
        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
      </div>
    );
  }
);

SelectInput.displayName = "SelectInput";

export type { OptionType as SelectOption };

export default SelectInput;
