"use client";

import {useAuth} from "@/lib/auth-context.tsx";
import {AuthWrapper} from "@/components/auth-wrapper.tsx";
import React, {useMemo} from "react";
import {Box, Container, Heading, HStack, Separator, SimpleGrid, Text, useDisclosure, VStack} from "@chakra-ui/react";
import StandardHeader from "@/components/standard-header.tsx";
import {useParams} from "next/navigation";
import {useQuery} from "@tanstack/react-query";
import { fetchTeam } from "@/app/teams/supabase.ts";
import CustomTabs from "@/components/tabbed-page.tsx";
import {fetchClipsCustom} from "@/app/clips/supabase.ts";
import LoadingSpinner from "@/components/ui/loading-spinner.tsx";
import {ClipGrid} from "@/app/clips/components/clip-grid.tsx";
import {fetchTeamMapping, getPlayersForTeam} from "@/app/players/supabase.ts";
import {PlayerGrid} from "@/components/ui/player-grid.tsx";
import {PlayerModal} from "@/app/players/components/player-modal.tsx";
import FloatingActionButton from "@/components/ui/floating-plus.tsx";
import {fetchTeamPossessions} from "@/app/possessions/supabase.ts";
import {calculatePlayerStats, PlayerStatLine} from "@/app/stats/player/player-base-stats.ts";
import {StatLeaderCard} from "@/app/stats/player/components/player-stat-card.tsx";
import {PlayerStatsTable} from "@/app/stats/player/components/player-stat-table.tsx";

function TeamPageContent() {
  const {player} = useAuth()
  const { team_id } = useParams<{ team_id: string }>();
  const { open, onOpen, onClose } = useDisclosure();

  const { data: teamData, isLoading: isLoadingTeam } = useQuery({
    queryFn: () => fetchTeam(team_id),
    queryKey: ["team"]
  })

  const { data: playerTeamMapping, isLoading: isLoadingTeamPlayer } = useQuery({
    queryFn: fetchTeamMapping,
    queryKey: ["teamPlayer"]
  })

  // Calculate stats
  const { data: possessionData, isLoading: isLoadingPossessions } = useQuery({
    queryKey: ["teamPossessions", team_id],
    queryFn: () => fetchTeamPossessions(team_id),
    enabled: !!team_id,
  });

  // Player stat lines
  const allPlayerStats = useMemo(() =>
      calculatePlayerStats(possessionData ?? [], playerTeamMapping ?? [], team_id),
    [possessionData, team_id, playerTeamMapping]
  );

  const filteredPlayerStats = useMemo(() => {
    if (!allPlayerStats) {
      return [];
    }
    // Filter for players with >0 points
    return allPlayerStats.filter(player => player.points_played > 0);
  }, [allPlayerStats]);

  // Find the leader for each category from the calculated stats
  const leaders = useMemo(() => {
    if (!filteredPlayerStats || filteredPlayerStats.length === 0) return {};

    const findLeader = (stat: keyof PlayerStatLine) =>
      filteredPlayerStats.reduce((top, current) => (current[stat] > top[stat] ? current : top));

    return {
      topScorer: findLeader('scores'),
      topAssister: findLeader('assists'),
      topDefender: findLeader('ds'),
      topPlusMinus: findLeader('plus_minus'),
    };
  }, [filteredPlayerStats]);

  const isLoading = isLoadingTeam || isLoadingPossessions || isLoadingTeamPlayer ;


  if (!player || isLoading) {
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
      <>
        <VStack gap={8} align="stretch">
          <Heading size="md" textAlign="center">Top Players</Heading>
          <SimpleGrid columns={{ base: 2, md: 4 }} gap={6}>
            <StatLeaderCard
              label="Scores"
              player={leaders.topScorer}
              statValue={leaders.topScorer?.scores}
            />
            <StatLeaderCard
              label="Assists"
              player={leaders.topAssister}
              statValue={leaders.topAssister?.assists}
            />
            <StatLeaderCard
              label="Ds"
              player={leaders.topDefender}
              statValue={leaders.topDefender?.ds}
            />
            <StatLeaderCard
              label="+/-"
              player={leaders.topPlusMinus}
              statValue={leaders.topPlusMinus?.plus_minus}
            />
          </SimpleGrid>
          <HStack mb={4} mt={4}>
            <Separator flex="1" size="sm"></Separator>
            <Text flexShrink="0" fontSize="xl">Overview</Text>
            <Separator flex="1" size="sm"></Separator>
          </HStack>
          <PlayerStatsTable data={filteredPlayerStats} />
        </VStack>
      </>
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
        <FloatingActionButton onClick={onOpen} iconType="add" />
        <PlayerModal
          isOpen={open}
          onClose={onClose}
          mode="add"
          teamId={team_id}
        />

      </>

    );
  }

  // CLIPS
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
