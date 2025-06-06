"use client"

import React, {useEffect, useState} from "react";
import {Box, Container, LinkBox, LinkOverlay, Table, Text} from "@chakra-ui/react";
import NextLink from "next/link";
import {fetchAllPoints} from "@/app/points/supabase";
import type {Point} from "@/lib/supabase";
import {BaseTeamInfo, fetchTeamMapping} from "@/app/teams/supabase";
import {AuthWrapper} from "@/components/auth-wrapper";
import {useAuth} from "@/lib/auth-context.tsx";
import StandardHeader from "@/components/standard-header.tsx";


function EventsPageContent() {
  const { player } = useAuth();
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState<Point[]>([]);
  const [teamMapping, setTeamMapping] = useState<BaseTeamInfo[]>([]);

  // Fetch data needed for page
  useEffect(() => {
    async function loadData() {

      // Fetch all points
      const points = await fetchAllPoints();
      setPoints(points);

      // Fetch team id/name mapping table
      const teamMapping = await fetchTeamMapping();
      setTeamMapping(teamMapping);

      setLoading(false);
    }
    loadData();
  }, );

  const teamIdToName = Object.fromEntries(
    teamMapping.map((t) => [t.team_id, t.team_name])
  );

  if (!player || loading) {
    return (
      <Box minH="100vh" p={4} display="flex" alignItems="center" justifyContent="center">
        <Text color="white" fontSize="lg">Loading player data...</Text>
      </Box>
    )
  }

  return (
    <Container maxW="4xl">
      <StandardHeader text="Point Search" is_admin={player.is_admin} />
      <Table.Root size="lg" interactive colorPalette={"gray"}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Offence Team</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="right" width="25%">Timestamp</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {points.map((point) => (
            <Table.Row key={point.point_id}>
              <Table.Cell>
                <LinkBox as="div">
                  <LinkOverlay as={NextLink} href={`/events/${point.event_id}/${point.point_id}/view`}>
                    {teamIdToName[point.offence_team] ?? point.offence_team}
                  </LinkOverlay>
                </LinkBox>
              </Table.Cell>
              <Table.Cell textAlign="right" width="25%">{point.timestamp}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Container>
  );
}

export default function EventsPage() {
  return (
    <AuthWrapper>
      <EventsPageContent />
    </AuthWrapper>
  )
}

