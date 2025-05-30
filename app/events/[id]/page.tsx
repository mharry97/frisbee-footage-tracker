"use client";

import React, { useEffect, useState } from "react";
import NextLink from "next/link";
import {
  Container,
  Heading,
  Flex,
  Table,
  LinkBox,
  LinkOverlay,
  SimpleGrid,
  Separator,
  Box,
  Grid,
} from "@chakra-ui/react";
import Header from "@/components/header";
import LoadingSpinner from "@/components/ui/loading-spinner";
import CustomTabs from "@/components/tabbed-page";
import { fetchEvent } from "@/app/events/supabase";
import { fetchEventPoints } from "@/app/points/supabase";
import type {Clip, Event, Point, Possession, TeamPlayer} from "@/lib/supabase";
import FloatingActionButton from "@/components/ui/plus-button";
import {BaseTeamInfo, fetchTeamMapping} from "@/app/teams/supabase";
import {fetchEventPossessions} from "@/app/possessions/supabase";
import {convertTimestampToSeconds} from "@/lib/utils";
import {fetchPlayerTeamMapping} from "@/lib/supabase";
import {GenericTableItem, MyDynamicTable, myPieChart, myStackedBarChart} from "@/app/stats/charts";
import {playerStats, SequenceStat, sequenceStats, teamStats} from "@/app/stats/utils";
import {fetchEventClips} from "@/app/clips/supabase";
import {ClipGrid} from "@/app/clips/components/clip-grid";
import {AuthWrapper} from "@/components/auth-wrapper";

export default function EventPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap the promised params
  const { id } = React.use(params);
  const [eventData, setEventData] = useState<Event | null>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [possessions, setPossessions] = useState<Possession[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamMapping, setTeamMapping] = useState<BaseTeamInfo[]>([]);
  const [playerTeamMapping, setPlayerTeamMapping] = useState<TeamPlayer[]>([]);
  const [clipData, setClipData] = useState<Clip[]>([]);


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

      // Get all clips
      const clipData = await fetchEventClips(id);
      setClipData(clipData)

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

  const teamIdToName = Object.fromEntries(
    teamMapping.map((t) => [t.team_id, t.team_name])
  );

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
        <Table.Root size="lg" interactive colorPalette={"gray"}>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Offence Team</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="right" width="25%">Timestamp</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sortedPoints.map((point) => (
              <Table.Row key={point.point_id}>
                <Table.Cell>
                  <LinkBox as="div">
                    <LinkOverlay as={NextLink} href={`/events/${id}/${point.point_id}/view`}>
                      {teamIdToName[point.offence_team] ?? point.offence_team}
                    </LinkOverlay>
                  </LinkBox>
                </Table.Cell>
                <Table.Cell textAlign="right" width="25%">{point.timestamp}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
        <NextLink href={`/events/${eventData ? eventData.event_id : ""}/new-point`} passHref>
          <FloatingActionButton aria-label="Add Point" />
        </NextLink>
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

  const ActivitiesContent = () => (
    <FloatingActionButton aria-label="Add Activity" />
  );

  const ClipsContent = () => (
    <>
      <ClipGrid clips={clipData}></ClipGrid>
    </>
  );

  // Determine if this event is a scrimmage
  const isTraining = eventData?.type === "Training";

  // Set up the tabs array based on the event type
  const tabs = isTraining
    ? [
      {
        value: "activities",
        label: "activities",
        content: <ActivitiesContent />,
      },
      {
        value: "clips",
        label: "clips",
        content: <ClipsContent />,
      },
    ]
    : [
      {
        value: "overview",
        label: "overview",
        content: <OverviewContent />,
      },
      {
        value: "points",
        label: "points",
        content: <PointsContent />,
      },
      {
        value: "clips",
        label: "clips",
        content: <ClipsContent />,
      },
    ];

  // Determine the default tab
  const defaultTab = isTraining ? "activities" : "overview";

  return (
    <AuthWrapper>
      <Container maxW="4xl">
        <Header
          title={eventData ? eventData.event_name : ""}
          buttonText="events"
          redirectUrl="/events"
        />
        {loading ? (
          <LoadingSpinner text="loading..." />
        ) : (
          <CustomTabs defaultValue={defaultTab} tabs={tabs} />
        )}
      </Container>
    </AuthWrapper>
  );
}
