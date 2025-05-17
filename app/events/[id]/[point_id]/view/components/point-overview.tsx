import React from "react";
import { Box, Container, HStack, VStack, Text } from "@chakra-ui/react";

type PointOverviewProps = {
  last_possession_type: string;
  possessions: number;
  scorer: string;
  outcome: string;
};

export default function PointOverview({
                                        last_possession_type,
                                        possessions,
                                        scorer,
                                        outcome,
                                      }: PointOverviewProps) {
  const turns = possessions - 1;

  return (
    <Container maxW="4xl" py={8} px={0}>
      <Box bg="gray.950" p={4} rounded="md" w="full">
        {last_possession_type === "Turnover" ? (
          <Text color="gray.400">
            No scoring possession has been added yet. Currently {possessions} possessions have been recorded.
          </Text>
        ) : (
          <HStack spacing={6} w="80%" mx="auto" justify="space-between">
            <VStack>
              <Text fontWeight="bold">Outcome</Text>
              <Text color="yellow.400" fontWeight="bold">{outcome}</Text>
            </VStack>
            <VStack>
              <Text fontWeight="bold">Turns</Text>
              <Text color="yellow.400" fontWeight="bold">{turns}</Text>
            </VStack>
            <VStack>
              <Text fontWeight="bold">Scorer</Text>
              <Text color="yellow.400" fontWeight="bold">{scorer}</Text>
            </VStack>
          </HStack>
        )}
      </Box>
    </Container>

  );
}
