import {Box, Center, VStack, Text} from "@chakra-ui/react";
import { InfoTip } from "./ui/toggle-tip";

interface StatTileProps {
  title: string;
  value: number;
  help?: string;
}

export default function StatTile({ title, value, help }: StatTileProps) {
  return (
    <Center>
      <Box
        width={110}
        height={110}
      >
        <VStack>
          <Text mt={2} color="gray.400">
            {title}
            {help && <InfoTip>{help}</InfoTip>}
          </Text>
          <Text color="yellow.400" fontSize="3xl">
            {value}
          </Text>
        </VStack>
      </Box>
    </Center>
  )
}
