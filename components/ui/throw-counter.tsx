import React, { useState } from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";

interface ThrowsCounterProps {
  initialValue?: number;
  onChange?: (newValue: number) => void;
}

export function ThrowsCounter({
                                initialValue = 0,
                                onChange,
                              }: ThrowsCounterProps) {
  const [count, setCount] = useState<number>(initialValue);

  function handleIncrement() {
    const newValue = count + 1;
    setCount(newValue);
    onChange?.(newValue);
  }

  function handleDecrement() {
    const newValue = Math.max(0, count - 1);
    setCount(newValue);
    onChange?.(newValue);
  }

  return (
    <Box>
      <Text fontSize="md" color="white" mb={2}>
        Throws
      </Text>
      <Flex alignItems="center" gap={2}>
        <Box
          bg="#2a2a2a"
          color="white"
          borderWidth="1px"
          borderColor="#3a3a3a"
          borderRadius="md"
          minW="56px"
          textAlign="center"
          py={2}
        >
          {count}
        </Box>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDecrement}
          bg="#2a2a2a"
          borderColor="#3a3a3a"
          color="white"
          _hover={{ bg: "#333" }}
        >
          -
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleIncrement}
          bg="#2a2a2a"
          borderColor="#3a3a3a"
          color="white"
          _hover={{ bg: "#333" }}
        >
          +
        </Button>
      </Flex>
    </Box>
  );
}
