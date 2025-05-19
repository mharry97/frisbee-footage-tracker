import { Field, HStack, IconButton, Text } from "@chakra-ui/react";
import { LuMinus, LuPlus } from "react-icons/lu";
import React from "react";

type ThrowCounterProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function ThrowCounter({ value, onChange }: ThrowCounterProps) {
  const increment = () => {
    const next = parseInt(value || "0", 10) + 1;
    onChange(next.toString());
  };

  const decrement = () => {
    const next = Math.max(0, parseInt(value || "0", 10) - 1);
    onChange(next.toString());
  };

  return (
    <Field.Root mb={4}>
      <Field.Label>Throws</Field.Label>
      <HStack gap={4}>
        <IconButton
          variant="outline"
          size="sm"
          aria-label="Decrease throws"
          onClick={decrement}
        >
          <LuMinus />
        </IconButton>
        <Text fontSize="lg" minW="3ch" textAlign="center">
          {value}
        </Text>
        <IconButton
          variant="outline"
          size="sm"
          aria-label="Increase throws"
          onClick={increment}
        >
          <LuPlus />
        </IconButton>
      </HStack>
    </Field.Root>
  );
}
