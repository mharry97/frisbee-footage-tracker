import React from "react";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Select, SingleValue } from "chakra-react-select";

interface BooleanSelectProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  isRequired?: boolean;
}

const booleanOptions = [
  { label: "TRUE", value: "TRUE" },
  { label: "FALSE", value: "FALSE" },
];

export const BooleanSelect: React.FC<BooleanSelectProps> = ({
                                                              label,
                                                              value,
                                                              onChange,
                                                              isRequired,
                                                            }) => {
  function handleSelectChange(newValue: SingleValue<{ label: string; value: string }>) {
    if (!newValue) {
      onChange("");
      return;
    }
    onChange(newValue.value);
  }

  // Convert the current value to the matching option (if it exists), otherwise null.
  const selectedOption =
    value !== ""
      ? booleanOptions.find((opt) => opt.value === value) || { label: value, value }
      : null;

  return (
    <FormControl mb={4} isRequired={isRequired}>
      <FormLabel color="gray.300" mb={4}>{label}</FormLabel>
      <Select<{ label: string; value: string }>
        placeholder="Choose a value"
        options={booleanOptions}
        value={selectedOption}
        onChange={handleSelectChange}
        chakraStyles={{
          container: (provided) => ({ ...provided, bg: "#2a2a2a" }),
          control: (provided) => ({
            ...provided,
            bg: "#2a2a2a",
            color: "white",
          }),
          menuList: (provided) => ({ ...provided, bg: "#1a1a1a" }),
          option: (provided) => ({
            ...provided,
            backgroundColor: "#1a1a1a",
            color: "white",
            ":hover": { backgroundColor: "#333" },
          }),
          placeholder: (provided) => ({ ...provided, color: "gray.400" }),
          singleValue: (provided) => ({ ...provided, color: "white" }),
        }}
      />
    </FormControl>
  );
};
