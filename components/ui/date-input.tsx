import { Field, Input } from "@chakra-ui/react"
import React from "react"

interface DateInputProps {
  label: string
  value: string
  onChange: (val: string) => void
  isRequired?: boolean
}

export const DateInput: React.FC<DateInputProps> = ({
                                                      label,
                                                      value,
                                                      onChange,
                                                      isRequired,
                                                    }) => {
  return (
    <Field.Root required={isRequired}>
      <Field.Label color="gray.300" mb={1}>
        {label}
      </Field.Label>
      <Input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        color="gray.400"
      />
    </Field.Root>
  )
}
