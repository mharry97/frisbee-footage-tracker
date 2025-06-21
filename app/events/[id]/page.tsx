"use client";

import React, { useEffect, useState } from "react";
import NextLink from "next/link";
import {
  Container,
  Heading,
  Flex,
  SimpleGrid,
  Separator,
  Box,
  Grid, Text, Card, Badge, Button, Dialog, Portal, CloseButton, HStack } from "@chakra-ui/react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import CustomTabs from "@/components/tabbed-page";
import { fetchEvent, type Event } from "@/app/events/supabase";
import { fetchEventPoints, PointDetailed } from "@/app/points/supabase";
import type {Possession} from "@/lib/supabase";
import {TeamDetailed, fetchTeamMapping } from "@/app/teams/supabase";
import {fetchEventPossessions} from "@/app/possessions/supabase";
import {baseUrlToTimestampUrl, convertTimestampToSeconds} from "@/lib/utils";
import {fetchPlayerTeamMapping} from "@/app/teams/[team_id]/[player_id]/supabase";
import {GenericTableItem, MyDynamicTable, myPieChart, myStackedBarChart} from "@/app/stats/charts";
import {playerStats, SequenceStat, sequenceStats, teamStats} from "@/app/stats/utils";
import { fetchClips } from "@/app/clips/supabase";
import {TeamPlayer} from "@/app/teams/[team_id]/[player_id]/supabase.ts";
import {useParams} from "next/navigation";
import {useAuth} from "@/lib/auth-context.tsx";
import StandardHeader from "@/components/standard-header.tsx";
import {AuthWrapper} from "@/components/auth-wrapper.tsx";
import OnPageVideoLink from "@/components/on-page-video-link.tsx";
import PointForm from "@/app/events/[id]/components/new-point-form.tsx";
import {useQuery} from "@tanstack/react-query";

function EventPageContent() {
  // Unwrap the promised params
  const { id } = useParams<{ id: string }>();
  const { player } = useAuth();
  const [eventData, setEventData] = useState<Event | null>(null);
  const [points, setPoints] = useState<PointDetailed[]>([]);
  const [possessions, setPossessions] = useState<Possession[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamMapping, setTeamMapping] = useState<TeamDetailed[]>([]);
  const [playerTeamMapping, setPlayerTeamMapping] = useState<TeamPlayer[]>([]);

  const { data: clips, isLoading } = useQuery({
    queryFn: () => fetchClips(),
    queryKey: ["clips"]
  })


  // Fetch data needed for page
  useEffect(() => {
    if (!id) return;
    async function loadData() {
      // Fetch event data
      const eventData = await fetchEvent(id);
      if (!eventData) {
        setLoading(false);
        return;
      }
      setEventData(eventData);

      // Fetch all points for event
      const points = await fetchEventPoints(id);
      setPoints(points);

      // Fetch all possessions for event
      const possessions = await fetchEventPossessions(id);
      setPossessions(possessions);

      // Fetch team id/name mapping table
      const teamMapping = await fetchTeamMapping();
      setTeamMapping(teamMapping);

      // Fetch player/team mapping table
      const playerTeamMapping = await fetchPlayerTeamMapping();
      setPlayerTeamMapping(playerTeamMapping);

      setLoading(false);
    }
    loadData();
  }, [id]);

  // TEAM LEVEL STATS
  const teamLevelStats = teamStats(possessions, teamMapping);

  const turnoversData = teamLevelStats.map((team) => ({
    name: team.team_name,
    value: team.Turns,
  }));

  const scoreData = teamLevelStats.map((team) => ({
    name: team.team_name,
    value: team.Scores,
  }));

  const breakData = teamLevelStats.map((team) => ({
    name: team.team_name,
    value: team.Breaks,
  }));

  // Possessions
  const sequenceData = sequenceStats(possessions, teamMapping);

  const teamOneOffenceSequences = sequenceData
    .filter((s) => s.team_id === eventData?.team_1_id && s.role === "offence")
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const teamOneDefenceSequences = sequenceData
    .filter((s) => s.team_id === eventData?.team_1_id && s.role === "defence")
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const teamTwoOffenceSequences = sequenceData
    .filter((s) => s.team_id === eventData?.team_2_id && s.role === "offence")
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const teamTwoDefenceSequences = sequenceData
    .filter((s) => s.team_id === eventData?.team_2_id && s.role === "defence")
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const toTableData = (items: SequenceStat[]): GenericTableItem[] =>
    items.map(({ initiation, main, count }) => ({
      initiation,
      main,
      possessions: count,
    }));

  // PLAYER LEVEL STATS
  const playerLevelStats = playerStats(possessions, playerTeamMapping);

  const teamOneName = teamMapping.find((t) => t.team_id === eventData?.team_1_id)?.team_name ?? "Team 1";
  const teamTwoName = teamMapping.find((t) => t.team_id === eventData?.team_2_id)?.team_name ?? "Team 2";

  const teamOneTopPlayers = playerLevelStats
    .filter((p) => p.team_id === eventData?.team_1_id)
    .sort((a, b) => b.scores + b.assists + b.ds - (a.scores + a.assists + a.ds))
    .slice(0, 5)
    .map((p) => ({
      name: p.player_name,
      Scores: p.scores,
      Assists: p.assists,
      Ds: p.ds,
    }));

  const teamTwoTopPlayers = playerLevelStats
    .filter((p) => p.team_id === eventData?.team_2_id)
    .sort((a, b) => b.scores + b.assists + b.ds - (a.scores + a.assists + a.ds))
    .slice(0, 5)
    .map((p) => ({
      name: p.player_name,
      Scores: p.scores,
      Assists: p.assists,
      Ds: p.ds,
    }));

  const PointsContent = () => {
    const sortedPoints = [...points].sort(
      (a, b) =>
        convertTimestampToSeconds(a.timestamp) -
        convertTimestampToSeconds(b.timestamp)
    );

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


  const OverviewContent = () => (
    <>
      <Flex direction="column" align="center" mb={8}>
        <Heading size="md" mb={4} color="white">
          Score
        </Heading>

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
          <Box h="100%" w="1px" bg="#facc15" />
          <Flex direction="column" align="flex-start" gap={4}>
            {scoreData.map((team) => (
              <Heading key={team.name + "-score"} size="md" color="white">
                {team.value}
              </Heading>
            ))}
          </Flex>
        </Grid>
      </Flex>
      <Separator mb={8}></Separator>
      <SimpleGrid columns={{ base: 1, md: 2 }} rowGap = "10" >
        {myPieChart("Turnovers", turnoversData)}
        {myPieChart("Breaks", breakData)}
        {myStackedBarChart(`${teamOneName} Top Contributors`, teamOneTopPlayers, ["Scores", "Assists", "Ds"])}
        {myStackedBarChart(`${teamTwoName} Top Contributors`, teamTwoTopPlayers, ["Scores", "Assists", "Ds"])}
      </SimpleGrid>
      <Flex direction="column" align="center" width="100%" mt={8} gap={8}>
        <MyDynamicTable
          title={`Top ${teamOneName} Offence Sequences`}
          keys={["initiation", "main", "possessions"]}
          data={toTableData(teamOneOffenceSequences)}
        />
        <MyDynamicTable
          title={`Top ${teamTwoName} Offence Sequences`}
          keys={["initiation", "main", "possessions"]}
          data={toTableData(teamTwoOffenceSequences)}
        />
        <MyDynamicTable
          title={`Top ${teamOneName} Defence Sequences`}
          keys={["initiation", "main", "possessions"]}
          data={toTableData(teamOneDefenceSequences)}
        />
        <MyDynamicTable
          title={`Top ${teamTwoName} Defence Sequences`}
          keys={["initiation", "main", "possessions"]}
          data={toTableData(teamTwoDefenceSequences)}
        />
      </Flex>

    </>
  )

  const ClipsContent = () => (
    <>
      {!clips ? (
        <Text color="white" fontSize="lg">No teams yet!</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={8} mb={8}>
          {clips.map((item) => (
            <Card.Root key={item.clip_id} variant="elevated">
              <Card.Header>
                <Card.Title>{item.title}</Card.Title>
              </Card.Header>
              <Card.Body>
                <Card.Description>
                  {item.description}
                </Card.Description>
              </Card.Body>
              <Card.Footer gap="2">
                Hello
              </Card.Footer>
            </Card.Root>
          ))}
        </SimpleGrid>
      )}
    </>
  );

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

  if (!player || loading || isLoading) {
    return (
      <Box minH="100vh" p={4} display="flex" alignItems="center" justifyContent="center">
        <Text color="white" fontSize="lg">Loading player data...</Text>
      </Box>
    )
  }

  return (
    <Container maxW="4xl">
      <StandardHeader text={eventData ? eventData.event_name : ""} is_admin={player.is_admin} />
      {loading ? (
        <LoadingSpinner text="Loading..." />
      ) : (
        <CustomTabs defaultValue="overview" tabs={tabs} />
      )}
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
