import React from "react";
import {Box, Container, HStack, Separator, Text} from "@chakra-ui/react";
import PossessionOverview from "@/app/events/[id]/[point_id]/view/components/possession-overview";
import PossessionPlays from "@/app/events/[id]/[point_id]/view/components/possession-plays";
import PossessionOutcomeTurnover from "@/app/events/[id]/[point_id]/view/components/possession-outcome";
import type { PossessionOutcomeProps } from "./possession-outcome"
import type { PossessionPlayProps } from "./possession-plays"
import type { PossessionOverviewProps } from "./possession-overview"

type PointSectionProps = {
  overview: PossessionOverviewProps;
  plays: PossessionPlayProps;
  turnover: PossessionOutcomeProps;
};

export default function PossessionSection({
                                        overview,
                                        plays,
                                        turnover
                                      }: PointSectionProps) {

  return (
    <Container maxW="4xl" px={0} mb={4}>
      <HStack mb={4} mt={4}>
        <Separator flex="1" size="sm"></Separator>
        <Text flexShrink="0" fontSize="xl">Overview</Text>
        <Separator flex="1" size="sm"></Separator>
      </HStack>
      <Box p={4} w="full" mb={4}>
        <PossessionOverview {...overview}></PossessionOverview>
      </Box>
      <HStack mb={4} mt={4}>
        <Separator flex="1" size="sm"></Separator>
        <Text flexShrink="0" fontSize="xl">Plays</Text>
        <Separator flex="1" size="sm"></Separator>
      </HStack>
      <Box p={4} w="full" mb={4}>
      <PossessionPlays {...plays}></PossessionPlays>
      </Box>
      <HStack mb={4} mt={4}>
        <Separator flex="1" size="sm"></Separator>
        <Text flexShrink="0" fontSize="xl">Outcome</Text>
        <Separator flex="1" size="sm"></Separator>
      </HStack>
      <Box p={4} w="full" mb={4}>
        <PossessionOutcomeTurnover {...turnover}></PossessionOutcomeTurnover>
      </Box>
    </Container>
  );
}
