import {
  Center, HStack,
  Image,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import React from "react";

export type PossessionOutcomeProps = {
  throw_zone: number;
  receive_zone: number;
  thrower: string;
  receiver: string;
  turnover_reason: string;
  d_player: string;
  scorer: string;
  assister: string;
  method: string;
  outcome: string;
};

export default function PossessionOutcomeDetails({
                                          throw_zone,
                                          receive_zone,
                                          thrower,
                                          receiver,
                                          turnover_reason,
                                          d_player,
                                          scorer,
                                          assister,
                                          method,
                                          outcome,
                                        }: PossessionOutcomeProps) {
  return (
    outcome === "Turnover" ? (
      <VStack gap={6} align="center" mb={4} mt={4}>
        <Center>
          <Image src="/pitch-zoned.png" alt="Pitch Zoned" mb={4} />
        </Center>

        <SimpleGrid columns={2} gapX={20} gapY={7}>
          <StatBox label="Thrown From" value={String(throw_zone)} />
          <StatBox label="Thrown To" value={String(receive_zone)} />
          <StatBox label="Thrower" value={thrower} />
          <StatBox label="Receiver" value={receiver} />
          <StatBox label="Turnover Reason" value={turnover_reason} />
          <StatBox label="D Player" value={d_player} />
        </SimpleGrid>
      </VStack>
    ) : (
      <HStack gap={6} w="80%" mx="auto" justify="space-between">
        <VStack>
          <Text fontWeight="bold">Score Player</Text>
          <Text color="yellow.400" fontWeight="bold">{scorer}</Text>
        </VStack>
        <VStack>
          <Text fontWeight="bold">Assist Player</Text>
          <Text color="yellow.400" fontWeight="bold">{assister}</Text>
        </VStack>
        <VStack>
          <Text fontWeight="bold">Method</Text>
          <Text color="yellow.400" fontWeight="bold">{method}</Text>
        </VStack>
      </HStack>
      )
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <VStack align="center" textAlign="center">
      <Text fontWeight="bold">{label}</Text>
      <Text color="yellow.400" fontWeight="bold">
        {value}
      </Text>
    </VStack>
  );
}

