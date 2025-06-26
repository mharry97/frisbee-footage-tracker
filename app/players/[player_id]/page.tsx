"use client";

import {Box, Container, Heading, Text, useDisclosure, VStack} from "@chakra-ui/react";
import {AuthWrapper} from "@/components/auth-wrapper.tsx";
import React, {useMemo} from "react";
import {useAuth} from "@/lib/auth-context.tsx";
import StandardHeader from "@/components/standard-header.tsx";
import {useParams} from "next/navigation";
import {useQuery} from "@tanstack/react-query";
import {fetchPlayer, fetchTeamMapping} from "@/app/players/supabase.ts";
import CustomTabs from "@/components/tabbed-page.tsx";
import LoadingSpinner from "@/components/ui/loading-spinner.tsx";
import {ClipGrid} from "@/app/clips/components/clip-grid.tsx";
import {fetchClipsCustom} from "@/app/clips/supabase.ts";
import {PlayerModal} from "@/app/players/components/player-modal.tsx";
import FloatingActionButton from "@/components/ui/floating-plus.tsx";
import {fetchPlayerPossessions} from "@/app/possessions/supabase.ts";
import {calculatePlayerStats} from "@/app/stats/player/player-base-stats.ts";
import StatTile from "@/components/stat-tile.tsx";
import {fetchPlayerPoints} from "@/app/points/supabase.ts";
import {PointGrid} from "@/app/points/components/point-grid.tsx";


function PlayerPageContent() {
  const { player } = useAuth();
  const { player_id } = useParams<{ player_id: string }>();
  const { open, onOpen, onClose } = useDisclosure();

  const { data: playerData, isLoading } = useQuery({
    queryFn: () => fetchPlayer(player_id),
    queryKey: ["player", player_id],
    enabled: !!player_id,
  })

  const { data: possessions, isLoading: isLoadingPossessions } = useQuery({
    queryKey: ['playerPossessions', player_id],
    queryFn: () => fetchPlayerPossessions(player_id),
    enabled: !!player_id,
  });

  const { data: playerTeamMapping, isLoading: isLoadingTeamPlayer } = useQuery({
    queryFn: fetchTeamMapping,
    queryKey: ["teamPlayer"]
  })

  const playerStats = useMemo(() => {
    // Guard against running before data is ready
    if (!possessions || !playerTeamMapping) {
      return null;
    }

    const allInvolvedPlayerStats = calculatePlayerStats(possessions, playerTeamMapping);

    // Find the specific player's stats
    return allInvolvedPlayerStats.find(
      (p) => p.player_id === player_id
    );
  }, [possessions, playerTeamMapping, player_id]);

  if (!player || !playerData || isLoading || isLoadingTeamPlayer) {
    return (
      <Box minH="100vh" p={4} display="flex" alignItems="center" justifyContent="center">
        <Text color="white" fontSize="lg">Loading data...</Text>
      </Box>
    )
  }

  // OVERVIEW
  const OverviewContent = () => {
    return (
      <>
        <VStack>
          <Heading size="lg" mt={4} mb={4}>Overview</Heading>
          {isLoadingPossessions ? (
            <LoadingSpinner text="Loading data..." />
          ) : playerStats ? (
            <Box
              display="grid"
              gap="4"
              gridTemplateColumns="repeat(3, 1fr)"
              w="full"
            >
              <StatTile title="+/-" value={playerStats?.plus_minus ?? 0} />
              <StatTile title="Points Played" value={playerStats?.points_played ?? 0} />
              <StatTile title="Scores" value={playerStats?.scores ?? 0} />
              <StatTile title="Assists" value={playerStats?.assists ?? 0} />
              <StatTile title="Ds" value={playerStats?.ds ?? 0} />
              <StatTile title="Turns" value={playerStats.turnovers} />
            </Box>
          ) : (
            <Text>No stats available for this player.</Text>
          )}
        </VStack>
      </>
    )
  }

  // INFO
  const InfoContent = () => {
    return (
      <>
        <Text textStyle="xl">{playerData.notes || "No notes for this player yet"}</Text>
      </>
    );
  }

  // CLIPS
  const ClipsContent = () => {
    const { data: clips, isLoading } = useQuery({
      queryKey: ["playerClips", { clipPlayer: player_id, requestPlayer: player?.auth_user_id }],
      queryFn: () => fetchClipsCustom({
        clipPlayer: player_id,
        requestPlayer: player!.auth_user_id
      }),
      enabled: !!player_id && !!player,
    });
    if (isLoading) {
      return <LoadingSpinner text="Loading clips..." />;
    }
    return <ClipGrid clips={clips ?? []} />;
  };

  // POINTS
  const PointsContent = () => {
    const { data: playerPoints, isLoading } = useQuery({
      queryKey: ["playerPoints", player_id],
      queryFn: () => fetchPlayerPoints(player_id),
    })
    if (isLoading) {
      return <LoadingSpinner text="Loading points..." />;
    }
    return <PointGrid points={playerPoints ?? []} />

  }

  const tabs = [
    {
      value: "overview",
      label: "Overview",
      content: <OverviewContent />,
    },
    {
      value: "info",
      label: "Info",
      content: <InfoContent />,
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

  return (
    <Container maxW="4xl">
      <StandardHeader text={`${playerData.team_name} - ${playerData.player_name}`} is_admin={player.is_admin} />
      <CustomTabs defaultValue="overview" tabs={tabs} />
      <FloatingActionButton onClick={onOpen} iconType="edit" />
      <PlayerModal
        isOpen={open}
        onClose={onClose}
        mode="edit"
        playerToEdit={playerData}
      />
    </Container>
  )
}


export default function PlayerPage() {
  return (
    <AuthWrapper>
      <PlayerPageContent />
    </AuthWrapper>
  )
}
