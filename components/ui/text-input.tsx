import React from "react";
import { FormControl, FormLabel, FormControlProps } from "@chakra-ui/form-control"
import { Input, InputProps } from "@chakra-ui/react";

interface TextInputProps extends Omit<FormControlProps, "onChange"> {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  isRequired?: boolean;
  inputProps?: Omit<InputProps, "value" | "onChange">;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  isRequired,
  inputProps,
  ...formControlProps
}) => {
  return (
    <FormControl mb={4} isRequired={isRequired} {...formControlProps}>
      <FormLabel color="gray.300" mb={4}>{label}</FormLabel>
      <Input
        bg="#2a2a2a"
        color="white"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...inputProps}
      />
    </FormControl>
  );
};
