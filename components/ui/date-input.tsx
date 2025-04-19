import React from "react";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/react"

interface DateInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  isRequired?: boolean;
}

export const DateInput: React.FC<DateInputProps> = ({
  label,
  value,
  onChange,
  isRequired,
}) => {
  return (
    <FormControl mb={4} isRequired={isRequired}>
      <FormLabel color="gray.300" mb={5}>{label}</FormLabel>
      <Input
        type="date"
        color="gray.400"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </FormControl>
  );
};
