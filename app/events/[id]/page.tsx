"use client";

import React, { useEffect, useState } from "react";
import NextLink from "next/link";
import {Container, Box, Heading, Flex, Table, LinkBox, LinkOverlay} from "@chakra-ui/react";
import { Chart, useChart } from "@chakra-ui/charts"
import {Cell, LabelList, Legend, Pie, PieChart, Tooltip} from "recharts"
import Header from "@/components/header";
import LoadingSpinner from "@/components/ui/loading-spinner";
import CustomTabs from "@/components/tabbed-page";
import { BaseGrid } from "@/components/card-grid";
import { PointCard, PointCardProps } from "@/app/points/components/point-card";
import { fetchEvent } from "@/app/events/supabase";
import { fetchEventPoints } from "@/app/points/supabase";
import type {Event, Player, Point, Possession} from "@/lib/supabase";
import FloatingActionButton from "@/components/ui/plus-button";
import {BaseTeamInfo, fetchTeamMapping} from "@/app/teams/supabase";
import {fetchEventPossessions} from "@/app/possessions/supabase";
import {fetchPlayersForTeam} from "@/app/players/supabase";
import {convertTimestampToSeconds} from "@/lib/utils";

export default function EventPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap the promised params
  const { id } = React.use(params);
  const [eventData, setEventData] = useState<Event | null>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [possessions, setPossessions] = useState<Possession[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamMapping, setTeamMapping] = useState<BaseTeamInfo[]>([]);
  const [teamOnePlayers, setTeamOnePlayers] = useState<Player[]>([]);
  const [teamTwoPlayers, setTeamTwoPlayers] = useState<Player[]>([]);
  const turnoverCounts: Record<string, number> = {}
  const scoreCounts: Record<string, number> = {}
  const breakCounts: Record<string, number> = {}


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

      // Fetch player info for stats
      const [teamOnePlayers, teamTwoPlayers] = await Promise.all([
        fetchPlayersForTeam(eventData.team_1_id ?? ""),
        fetchPlayersForTeam(eventData.team_2_id ?? ""),
      ])

      setTeamOnePlayers(teamOnePlayers);
      setTeamTwoPlayers(teamTwoPlayers);

      setLoading(false);
    }
    loadData();
  }, [id]);

  const allPlayers = [...teamOnePlayers, ...teamTwoPlayers]

  // Count turnovers and scores for each team
  possessions.forEach((possession) => {
    if (possession.is_score) {
      scoreCounts[possession.offence_team] =
        (scoreCounts[possession.offence_team] ?? 0) + 1

      if (possession.possession_number % 2 === 0) {
        // breaks
        breakCounts[possession.defence_team] =
          (breakCounts[possession.defence_team] ?? 0) + 1
      }
    } else {
      turnoverCounts[possession.offence_team] =
        (turnoverCounts[possession.offence_team] ?? 0) + 1
    }
  })

  const sortedTeams = [...teamMapping].sort((a, b) =>
    a.team_name.localeCompare(b.team_name)
  )

  const data = Object.entries(turnoverCounts).map(([teamId, value], index) => {
    const teamName =
      sortedTeams.find((team) => team.team_id === teamId)?.team_name ??
      `Unknown (${teamId})`

    const colorTokens = [
      "#facc15",
      "#a1a1aa"
    ]

    return {
      name: teamName,
      value,
      color: colorTokens[index % colorTokens.length],
    }
  })

  const scoreData = Object.entries(scoreCounts).map(([teamId, value], index) => {
    const teamName =
      sortedTeams.find((team) => team.team_id === teamId)?.team_name ??
      `Unknown (${teamId})`

    return {
      name: teamName,
      value
    }
  })

  const breakData = Object.entries(breakCounts).map(([teamId, value], index) => {
    const teamName =
      sortedTeams.find((team) => team.team_id === teamId)?.team_name ??
      `Unknown (${teamId})`

    return {
      name: teamName,
      value
    }
  })

  const teamIdToName = Object.fromEntries(
    teamMapping.map((t) => [t.team_id, t.team_name])
  );

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
                    <LinkOverlay as={NextLink} href={`/events/${point.point_id}`}>
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
      <Flex
        justify="center"
        align="center"
        gap={12}
        mb={10}
        px={4}
        py={4}
        width="100%"
        mx="auto"
      >
        <Flex direction="column" align="flex-end" gap={4}>
          {scoreData.map((team) => (
            <Heading key={team.name} size="md" color="white">
              {team.name}
            </Heading>
          ))}
        </Flex>

        <Flex direction="column" align="flex-start" gap={4}>
          {scoreData.map((team) => (
            <Heading key={team.name + "-score"} size="md" color="white">
              {team.value}
            </Heading>
          ))}
        </Flex>
      </Flex>
      <Flex
        width="100%"
        maxW="360px"
        flexDirection="column"
        alignItems="center"
        mx="auto"
      >
        <Heading size="md" textAlign="center" mb={4} width="100%">
          Turnovers
        </Heading>
        <PieChart width={300} height={300}>
          <Legend verticalAlign="bottom"
                  height={36}
          />
          <Tooltip />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            innerRadius={60}
            stroke="none"
            strokeWidth={1}
            labelLine={false}
            paddingAngle={11}
          >
            <LabelList position="inside" fill="white" stroke="none" />
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </Flex>

      <Flex
        width="100%"
        maxW="360px"
        flexDirection="column"
        alignItems="center"
        mx="auto"
      >
        <Heading size="md" textAlign="center" mb={4} width="100%">
          Breaks
        </Heading>
        <PieChart width={300} height={300}>
          <Legend verticalAlign="bottom"
                  height={36}
          />
          <Tooltip />
          <Pie
            data={breakData}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            innerRadius={60}
            stroke="none"
            strokeWidth={1}
            labelLine={false}
            paddingAngle={11}
          >
            <LabelList position="inside" fill="white" stroke="none" />
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </Flex>
    </>
  )

  const ActivitiesContent = () => (
    <FloatingActionButton aria-label="Add Activity" />
  );

  const ClipsContent = () => (
    <FloatingActionButton aria-label="Add Clip" />
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
  );
}
