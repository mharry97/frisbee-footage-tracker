import { Field, HStack, IconButton, Text } from "@chakra-ui/react";
import { LuMinus, LuPlus } from "react-icons/lu";
import React from "react";

type ThrowCounterProps = {
  value: number;
  onChange: (value: number) => void;
};

export default function ThrowCounter({ value = 0, onChange }: ThrowCounterProps) {
  const increment = () => {
    onChange(value + 1);
  };

  const decrement = () => {
    onChange(Math.max(0, value - 1));
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
