"use client";

import React, { useMemo } from "react";
import NextLink from "next/link";
import {
  Container,
  Heading,
  Flex,
  SimpleGrid,
  Separator,
  Box,
  Grid, Text, Card, Badge, Button, Dialog, Portal, CloseButton, HStack, VStack
} from "@chakra-ui/react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import CustomTabs from "@/components/tabbed-page";
import { fetchEventPoints } from "@/app/points/supabase";
import { fetchEventPossessions } from "@/app/possessions/supabase";
import {baseUrlToTimestampUrl, convertTimestampToSeconds} from "@/lib/utils";
import { fetchClipsCustom } from "@/app/clips/supabase";
import {useParams} from "next/navigation";
import {useAuth} from "@/lib/auth-context.tsx";
import StandardHeader from "@/components/standard-header.tsx";
import {AuthWrapper} from "@/components/auth-wrapper.tsx";
import OnPageVideoLink from "@/components/on-page-video-link.tsx";
import PointForm from "@/app/events/[id]/components/new-point-form.tsx";
import {useQuery} from "@tanstack/react-query";
import ScoreProgressionChart from "@/app/stats/components/charts/ScoreProgressionChart.tsx";
import {transformPointsForScoreChart} from "@/app/stats/game-flow.ts";
import {fetchEvent} from "@/app/events/supabase.ts";
import {CalculatedStat, calculateGameStats} from "@/app/stats/game-stats.ts";
import {StatRow} from "@/app/stats/components/charts/StatRow.tsx";
import {ClipGrid} from "@/app/clips/components/clip-grid.tsx";

function EventPageContent() {
  const { id } = useParams<{ id: string }>();
  const { player } = useAuth();

  const { data: points, isLoading: isLoadingPoints } = useQuery({
    queryKey: ['points', id],
    queryFn: () => fetchEventPoints(id),
    enabled: !!id,
  });

  // Fetch the possessions for this event
  const { data: possessions, isLoading: isLoadingPossessions } = useQuery({
    queryKey: ['possessions', id],
    queryFn: () => fetchEventPossessions(id),
    enabled: !!id,
  });

  // Fetch event data
  const { data: event, isLoading: isLoadingEvent } = useQuery({
    queryKey: ['event', id],
    queryFn: () => fetchEvent(id),
    enabled: !!id,
  });

  const isLoading = isLoadingPossessions || isLoadingPoints || isLoadingEvent;
  const hasPoints = points?.length != 0;

  // STATS
  const scoreData = useMemo(() => {
    if (!points || points.length === 0) {
      return [];
    }
    const scoreTally: { [key: string]: number } = {};
    for (const point of points) {
      let scoringTeamName: string | null = null;

      if (point.point_outcome === 'hold') {
        scoringTeamName = point.offence_team_name;
      } else if (point.point_outcome === 'break') {
        scoringTeamName = point.defence_team_name;
      }
      if (scoringTeamName) {
        scoreTally[scoringTeamName] = (scoreTally[scoringTeamName] || 0) + 1;
      }
    }
    return Object.entries(scoreTally).map(([teamName, score]) => ({
      name: teamName,
      value: score,
    }));
  }, [points]);

  // Game Flow
  const scoreChartData = useMemo(() => {
    if (!points || !event) {
      return [];
    }
    return transformPointsForScoreChart(points, event);
  }, [points, event]);

  // Stat grid
  const gameStats = useMemo(() => {
    if (!points || !event || !possessions) {
      return [] as CalculatedStat[];
    }
    return calculateGameStats(points, possessions, event);
    }, [points, possessions, event]);


  const PointsContent = () => {
    const sortedPoints = [...(points ?? [])].sort(
      (a, b) =>
        convertTimestampToSeconds(a.timestamp) -
        convertTimestampToSeconds(b.timestamp)
    );
    if (!hasPoints) {
      return (
        <Box minH="100vh" p={4} display="flex" alignItems="center" justifyContent="center">
          <Text color="white" fontSize="lg">No points for this event yet.</Text>
        </Box>
      )
    }
    return (
      <>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={8} mb={8}>
          {sortedPoints.map((item, index) => (
            <Card.Root key={index} variant="elevated">
              <Card.Header>
                <Card.Title>
                  <HStack justify="space-between">
                    <Text>Offence: {item.offence_team_name}</Text>
                    {item.point_outcome === "break" ? (
                      <Badge colorPalette="red">Break</Badge>
                    ) : item.point_outcome === "hold" ? (
                      <Badge colorPalette="green">Hold</Badge>
                    ) : (
                      <></>
                    )}
                  </HStack>
                </Card.Title>
                <Card.Description>
                  {item.timestamp}
                </Card.Description>
              </Card.Header>
              {item.point_outcome === "unknown" ? (
                <Card.Body>
                  <Card.Description>
                    Point has not been fully statted.
                  </Card.Description>
                </Card.Body>
              ) : (
                <Card.Body>
                  <Text>
                    Assist: {item.assist_player_name || "Unknown"}
                  </Text>
                  <Text>
                    Score: {item.score_player_name || "Unknown"}
                  </Text>
                  <Card.Description mt={2}>
                    {item.possession_number - 1}{item.possession_number === 2 ? " Turn" : " Turns"}
                  </Card.Description>
                </Card.Body>
              )}
              <Card.Footer gap="2">
                <NextLink href={`/events/${item.event_id}/${item.point_id}/view`} passHref>
                  <Button variant="solid" colorPalette="gray">
                    Details
                  </Button>
                </NextLink>
                <Dialog.Root size="xl">
                  <Dialog.Trigger asChild>
                    <Button variant="ghost" colorPalette="gray">Quick View</Button>
                  </Dialog.Trigger>
                  <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                      <Dialog.Content>
                        <Dialog.Body>
                          <OnPageVideoLink url={baseUrlToTimestampUrl(item.base_url, item.timestamp)} />
                        </Dialog.Body>
                        <Dialog.CloseTrigger asChild>
                          <CloseButton size="sm" />
                        </Dialog.CloseTrigger>
                      </Dialog.Content>
                    </Dialog.Positioner>
                  </Portal>
                </Dialog.Root>
              </Card.Footer>
            </Card.Root>
          ))}
        </SimpleGrid>
        <PointForm event_id={id} />
      </>
    );
  };


  const OverviewContent = () => {
    if (!hasPoints) {
      return (
        <Box minH="100vh" p={4} display="flex" alignItems="center" justifyContent="center">
          <Text color="white" fontSize="lg">No stats for this event yet.</Text>
        </Box>
      )
    }
    return (
      <>
        <Flex direction="column" align="center" mb={8} mt={4}>
          <Text fontSize="xl">Score</Text>
          <Grid
            templateColumns="1fr auto 1fr"
            alignItems="center"
            gap={12}
            px={4}
            py={4}
            width="100%"
            maxW="lg"
            mx="auto"
          >
            <Flex direction="column" align="flex-end" gap={4}>
              {scoreData.map((team) => (
                <Heading key={team.name} size="md" color="white">
                  {team.name}
                </Heading>
              ))}
            </Flex>
            <Box h="100%" w="1px" bg="#facc15"/>
            <Flex direction="column" align="flex-start" gap={4}>
              {scoreData.map((team) => (
                <Heading key={team.name + "-score"} size="md" color="white">
                  {team.value}
                </Heading>
              ))}
            </Flex>
          </Grid>
        </Flex>
        <VStack>
          <HStack mb={4} mt={4} width="100%">
            <Separator flex="1" size="sm"></Separator>
            <Text flexShrink="0" fontSize="xl">Game Flow</Text>
            <Separator flex="1" size="sm"></Separator>
          </HStack>
          <Box height="300px" width="100%" mt={4} mb={4}>
            <ScoreProgressionChart
              data={scoreChartData}
              teamOneName={event?.team_1 ?? 'Team 1'}
              teamTwoName={event?.team_2 ?? 'Team 2'}
            />
          </Box>
          <HStack mb={4} mt={4} width="100%">
            <Separator flex="1" size="sm"></Separator>
            <Text flexShrink="0" fontSize="xl">Team Stats</Text>
            <Separator flex="1" size="sm"></Separator>
          </HStack>
          <VStack gap={6} mx="auto" width = "100%">
            <Grid templateColumns="1fr 1fr 1fr" gap={4} width="100%">
              <Heading textAlign="left">{event?.team_1}</Heading>
              <Box />
              <Heading textAlign="right">{event?.team_2}</Heading>
            </Grid>
            {(gameStats ?? []).map((stat) => (
              <StatRow
                key={stat.label}
                label={stat.label}
                teamOneValue={stat.teamOneValue}
                teamTwoValue={stat.teamTwoValue}
                isPercentage={stat.isPercentage}
              />
            ))}
          </VStack>
        </VStack>
      </>
    )
  };

  const ClipsContent = () => {
    const { data: clips, isLoading } = useQuery({
      queryKey: ["customClips", { eventId: id, requestPlayerId: player?.auth_user_id }],
      queryFn: () => fetchClipsCustom({
        eventId: id,
        requestPlayer: player!.auth_user_id
      }),
      enabled: !!id && !!player,
    });
    if (isLoading) {
      return <LoadingSpinner text="Loading clips..." />;
    }
    return <ClipGrid clips={clips ?? []} />;
  };

  // Set up the tabs available
  const tabs = [
      {
        value: "overview",
        label: "Overview",
        content: <OverviewContent />,
      },
      {
        value: "points",
        label: "Points",
        content: <PointsContent />,
      },
      {
        value: "clips",
        label: "Clips",
        content: <ClipsContent />,
      },
    ];

  if (!player || isLoading) {
    return (
      <Box minH="100vh" p={4} display="flex" alignItems="center" justifyContent="center">
        <Text color="white" fontSize="lg">Loading player data...</Text>
      </Box>
    )
  }

  return (
    <Container maxW="4xl">
      <StandardHeader text={points ? points[0].event_name : ""} is_admin={player.is_admin} />
      {isLoading ? (
        <LoadingSpinner text="Loading..." />
      ) : (
        <CustomTabs defaultValue="overview" tabs={tabs} />
      )}
      <Box width="100%" height="50px">
      </Box>
    </Container>
  );
}

export default function EventPage() {
  return (
    <AuthWrapper>
      <EventPageContent />
    </AuthWrapper>
  )
}
