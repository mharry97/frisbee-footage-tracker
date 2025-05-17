import React from "react";
import {Box, Container, Text} from "@chakra-ui/react";
import PossessionOverview from "@/app/events/[id]/[point_id]/view/components/possession-overview";
import PossessionPlays from "@/app/events/[id]/[point_id]/view/components/possession-plays";
import PossessionOutcomeTurnover from "@/app/events/[id]/[point_id]/view/components/possession-outcome";
import type PossessionOutcomeProps from "./possession-outcome"
import type PossessionPlayProps from "./possession-plays"
import type PossessionOverviewProps from "./possession-overview"

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
      <Text textStyle="xl">Overview</Text>
      <Box bg="gray.950" p={4} rounded="md" w="full" mb={4}>
        <PossessionOverview {...overview}></PossessionOverview>
      </Box>
      <Text textStyle="xl">Plays</Text>
      <Box bg="gray.950" p={4} rounded="md" w="full" mb={4}>
      <PossessionPlays {...plays}></PossessionPlays>
      </Box>
      <Text textStyle="xl">Outcome</Text>
      <Box bg="gray.950" p={4} rounded="md" w="full" mb={4}>
        <PossessionOutcomeTurnover {...turnover}></PossessionOutcomeTurnover>
      </Box>
    </Container>
  );
}
