import React from "react";
import { HStack, VStack, Text } from "@chakra-ui/react";

export type PossessionOverviewProps = {
  offence_team: string;
  throws: number;
  outcome: string;
};

export default function PossessionOverview({
                                        offence_team,
                                        throws,
                                        outcome,
                                      }: PossessionOverviewProps) {
  return (
    <HStack spacing={6} w="80%" mx="auto" justify="space-between">
      <VStack>
        <Text fontWeight="bold">Offence Team</Text>
        <Text color="yellow.400" fontWeight="bold">{offence_team}</Text>
      </VStack>
      <VStack>
        <Text fontWeight="bold">Throws</Text>
        <Text color="yellow.400" fontWeight="bold">{throws}</Text>
      </VStack>
      <VStack>
        <Text fontWeight="bold">Outcome</Text>
        <Text color="yellow.400" fontWeight="bold">{outcome}</Text>
      </VStack>
    </HStack>
  );
}
