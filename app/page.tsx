"use client"
import {
  Container,
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Center,
  Separator,
  Card, Button, SimpleGrid, Dialog, Portal, CloseButton, Badge
} from "@chakra-ui/react";
import NextLink from 'next/link';
import { AuthWrapper } from "@/components/auth-wrapper";
import { useAuth } from "@/lib/auth-context.tsx";
import {InfoTip} from "@/components/ui/toggle-tip.tsx";
import React, {useEffect, useState} from "react";
import {getPlayerPointsPlayed, PointsByPlayer} from "@/app/teams/[team_id]/[player_id]/supabase.ts";
import {getPlayerStatsFromPossessions, PlayerStats} from "@/app/teams/[team_id]/[player_id]/utils.ts";
import {fetchAllPointsDetailed} from "@/app/points/supabase.ts";
import OnPageVideoLink from "@/components/on-page-video-link.tsx";
import MainMenu from "@/components/main-menu.tsx";

interface StatTileProps {
  title: string;
  value: number;
  help?: string;
}

function StatTile({ title, value, help }: StatTileProps) {
  return (
    <Center>
      <Box
        width={110}
        height={110}
      >
        <VStack>
          <Text mt={2} color="gray.400">
            {title}
            {help && <InfoTip>{help}</InfoTip>}
          </Text>
          <Text color="yellow.400" fontSize="3xl">
            {value}
          </Text>
        </VStack>
      </Box>
    </Center>
  )
}

function HomepageContent() {
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

        const allPoints = await fetchAllPointsDetailed();
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
      <MainMenu is_admin={player.is_admin} />
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
        <Separator flex="1" size="sm" colorPalette='yellow'></Separator>
        <Text flexShrink="0" fontSize="xl" >Your Points</Text>
        <Separator flex="1" size="sm" colorPalette='yellow'></Separator>
      </HStack>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={8} mb={8}>
        {playerPoints.map((item, index) => (
          <Card.Root key={index} variant="elevated">
            <Card.Header>
              <Card.Title>{item.event_name}</Card.Title>
              <Card.Description>{item.timestamp}</Card.Description>
              <Text>
                Offence Team: {item.point_offence_team_name}
              </Text>
            </Card.Header>
            <Card.Body>
              <Card.Description>
                {item.point_outcome === "break" ? (
                  <Badge colorPalette="red">Break</Badge>
                ) : (
                  <Badge colorPalette="green">Hold</Badge>
                )}
              </Card.Description>
            </Card.Body>
            <Card.Footer gap="2">
              <NextLink href={`/events/${item.event_id}/${item.point_id}/view`} passHref>
                <Button variant="solid">
                  Details
                </Button>
              </NextLink>
              <Dialog.Root size="full">
                <Dialog.Trigger asChild>
                  <Button variant="ghost">Quick View</Button>
                </Dialog.Trigger>
                <Portal>
                  <Dialog.Backdrop />
                  <Dialog.Positioner>
                    <Dialog.Content>
                      <Dialog.Body>
                        <OnPageVideoLink url={item.timestamp_url} />
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
    </Container>
  );
}


export default function Homepage() {
  return (
    <AuthWrapper>
      <HomepageContent />
    </AuthWrapper>
  );
}

