"use client";

import {useAuth} from "@/lib/auth-context.tsx";
import {AuthWrapper} from "@/components/auth-wrapper.tsx";
import React, {useMemo} from "react";
import {Box, Container, Text} from "@chakra-ui/react";
import StandardHeader from "@/components/standard-header.tsx";
import {useParams} from "next/navigation";
import {useQuery} from "@tanstack/react-query";
import { fetchTeam } from "@/app/teams/supabase.ts";
import CustomTabs from "@/components/tabbed-page.tsx";
import {fetchClipsCustom} from "@/app/clips/supabase.ts";
import LoadingSpinner from "@/components/ui/loading-spinner.tsx";
import {ClipGrid} from "@/app/clips/components/clip-grid.tsx";
import {getPlayersForTeam} from "@/app/players/supabase.ts";
import {PlayerGrid} from "@/components/ui/player-grid.tsx";

function TeamPageContent() {
  const {player} = useAuth()
  const { team_id } = useParams<{ team_id: string }>();

  const { data: teamData, isLoading: isLoadingTeam } = useQuery({
    queryFn: () => fetchTeam(team_id),
    queryKey: ["team"]
  })

  if (!player || isLoadingTeam) {
    return (
      <Box minH="100vh" p={4} display="flex" alignItems="center" justifyContent="center">
        <Text color="white" fontSize="lg">Loading team data...</Text>
      </Box>
    );
  }
  if (!teamData) {
    return (
      <Container maxW="4xl">
        <StandardHeader text="Teams" is_admin={player.is_admin} />
        <Text color="white" fontSize="lg">Team does not exist</Text>
      </Container>
    )
  }

  // OVERVIEW
  const OverviewContent = () => {
    return (
      <Container maxW="4xl"></Container>
    )
  }

  // PLAYERS
  const PlayersContent = () => {
    const { data: players, isLoading } = useQuery({
      queryKey: ["players", team_id],
      queryFn: () => getPlayersForTeam(team_id),
      enabled: !!team_id && !!player,
    });
    // Filter for active/inactive
    const { activePlayers, inactivePlayers } = useMemo(() => {
      if (!players) {
        return { activePlayers: [], inactivePlayers: [] };
      }
      const active = players.filter(p => p.is_active);
      const inactive = players.filter(p => !p.is_active);

      return { activePlayers: active, inactivePlayers: inactive };
    }, [players]);

    if (isLoading) {
      return <LoadingSpinner text="Loading clips..." />;
    }
    return (
      <>
        <Text mb={4} mt={4} textStyle="2xl">Active Players</Text>
        <PlayerGrid players={activePlayers ?? []} />
        <Text mb={4} mt={4} textStyle="2xl">Inactive Players</Text>
        <PlayerGrid players={inactivePlayers ?? []} />

      </>

    );
  }

  // PLAYERS
  const ClipsContent = () => {
    const { data: clips, isLoading } = useQuery({
      queryKey: ["customClips", { teamId: team_id, requestPlayerId: player?.auth_user_id }],
      queryFn: () => fetchClipsCustom({
        teamId: team_id,
        requestPlayer: player!.auth_user_id
      }),
      enabled: !!team_id && !!player,
    });
    if (isLoading) {
      return <LoadingSpinner text="Loading clips..." />;
    }
    return <ClipGrid clips={clips ?? []} />;
  };



  const tabs = [
    {
      value: "overview",
      label: "Overview",
      content: <OverviewContent />,
    },
    {
      value: "players",
      label: "Players",
      content: <PlayersContent />,
    },
    {
      value: "clips",
      label: "Clips",
      content: <ClipsContent />,
    },
  ];


  return (
    <Container maxW="4xl">
      <StandardHeader text={teamData.team_name} is_admin={player.is_admin} />
      <CustomTabs defaultValue="overview" tabs={tabs} />
    </Container>
  )

}

export default function TeamsPage() {
  return (
    <AuthWrapper>
      <TeamPageContent />
    </AuthWrapper>
  )
}
