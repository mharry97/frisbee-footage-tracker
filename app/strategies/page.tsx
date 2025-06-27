"use client"
import {
  Container,
  Box,
  Heading,
  Text,
  HStack,
  Separator
} from "@chakra-ui/react";
import { AuthWrapper } from "@/components/auth-wrapper";
import { useAuth } from "@/lib/auth-context.tsx";
import React, {useEffect, useState} from "react";
import {getPlayerPointsPlayed, PointsByPlayer} from "@/app/teams/[team_id]/[player_id]/supabase.ts";
import {getPlayerStatsFromPossessions, PlayerStats} from "@/app/teams/[team_id]/[player_id]/utils.ts";
import { fetchAllPossessions } from "@/app/possessions/supabase.ts";
import MainMenu from "@/components/main-menu.tsx";
import StatTile from "@/components/stat-tile.tsx";
import {PointGrid} from "@/app/points/components/point-grid.tsx";

function StrategyPageContent() {
  const { player } = useAuth();
  const [playerPoints, setPlayerPoints] = useState<PointsByPlayer[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!player) return;

    (async () => {
      try {
        const points = await getPlayerPointsPlayed(player.player_id);
        setPlayerPoints(points);

        const allPoints = await fetchAllPossessions();
        const allStats = getPlayerStatsFromPossessions(allPoints);

        const currentPlayerStats = allStats[String(player.player_id)] ?? null;

        setPlayerStats(currentPlayerStats ?? null);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [player]);

  if (!player || loading) {
    return (
      <Box minH="100vh" p={4} display="flex" alignItems="center" justifyContent="center">
        <Text color="white" fontSize="lg">Loading player data...</Text>
      </Box>
    );
  }

  const turns = (playerStats?.drops ?? 0) + (playerStats?.throwaways ?? 0);
  const pointsPlayed = playerPoints.length


  return (
    <Container maxW="4xl">
      <Heading as="h1" fontWeight="light" size='4xl' color="white" mb={4} mt={4}>
        Hello, {player.player_name}
      </Heading>
      <MainMenu is_admin={player.is_admin} is_home />
      <HStack mb={6}>
        <Separator flex="1" size="sm" colorPalette='yellow'></Separator>
        <Text flexShrink="0" fontSize="2xl" >Player Overview</Text>
        <Separator flex="1" size="sm" colorPalette='yellow'></Separator>
      </HStack>
      <Box
        display="grid"
        gap="4"
        gridTemplateColumns="repeat(3, 1fr)"
        w="full"
      >
        <StatTile
          title="+/-"
          value={playerStats?.plusMinus ?? 0}
          // help="(Scores+Assists+Ds)-Turns" Currently throws off alignment
        />
        <StatTile
          title="Points Played"
          value={pointsPlayed}
        />
        <StatTile
          title="Scores"
          value={playerStats?.scores ?? 0}
        />
        <StatTile
          title="Assists"
          value={playerStats?.assists ?? 0}
        />
        <StatTile
          title="Ds"
          value={playerStats?.ds ?? 0}
        />
        <StatTile
          title="Turns"
          value={turns}
        />
      </Box>
      <HStack mb={6}>
        <Separator flex="1" size="sm"></Separator>
        <Text flexShrink="0" fontSize="xl" >Your Points</Text>
        <Separator flex="1" size="sm"></Separator>
      </HStack>
      <PointGrid points={playerPoints} />
    </Container>
  );
}


export default function StrategyPage() {
  return (
    <AuthWrapper>
      <StrategyPageContent />
    </AuthWrapper>
  );
}

