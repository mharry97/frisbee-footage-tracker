import {Box, Center, VStack, Text} from "@chakra-ui/react";

interface StatTileProps {
  title: string;
  value: number;
}

export default function StatTile({ title, value }: StatTileProps) {
  return (
    <Center>
      <Box
        width={110}
        height={110}
      >
        <VStack>
          <Text mt={2} color="gray.400">
            {title}
          </Text>
          <Text color="yellow.400" fontSize="3xl">
            {value}
          </Text>
        </VStack>
      </Box>
    </Center>
  )
}
