import React, { useState, useEffect } from "react";
import { Field, NativeSelect, Input } from "@chakra-ui/react";

export interface Option {
  value: string;
  label: string;
}

export interface CustomDropdownInputProps {
  /** Array of options to show in the dropdown */
  options: Option[];
  /** A placeholder to show in either input or select */
  placeholder?: string;
  /** The label for the field (optional) */
  label?: string;
  /** Current value, which may be one of the option values or custom */
  value: string;
  /** Callback triggered when the value changes */
  onChange: (value: string) => void;
  /** The special value that triggers switching to input mode. Defaults to "custom". */
  customOptionValue?: string;
}

const CustomDropdownInput: React.FC<CustomDropdownInputProps> = ({
                                                                   options,
                                                                   placeholder,
                                                                   label,
                                                                   value,
                                                                   onChange,
                                                                   customOptionValue = "custom",
                                                                   ...fieldProps
                                                                 }) => {
  // internal mode: "dropdown" or "input"
  const [mode, setMode] = useState<"dropdown" | "input">("dropdown");

  // on mount or when value changes, if the value does not match any option,
  // switch to input mode.
  useEffect(() => {
    const match = options.find((opt) => opt.value === value);
    if (!match && value !== "") {
      setMode("input");
    } else {
      setMode("dropdown");
    }
  }, [value, options]);

  // When the dropdown changes, if the value is the custom trigger,
  // switch to input mode. Otherwise, just propagate the value.
  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue === customOptionValue) {
      setMode("input");
      onChange("");
    } else {
      onChange(selectedValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <Field.Root {...fieldProps} mb={4}>
      {label && <Field.Label>{label}</Field.Label>}
      {mode === "dropdown" ? (
        <NativeSelect.Root>
          <NativeSelect.Field
            placeholder={placeholder}
            value={value}
            onChange={handleDropdownChange}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
            {/* Extra option to trigger a custom entry */}
            <option value={customOptionValue}>+ Add Value</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      ) : (
        <Input
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
        />
      )}
    </Field.Root>
  );
};

export default CustomDropdownInput;
