"use client"
import {
  Container,
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Link as ChakraLink,
  Icon,
  Center,
  Separator,
  Card, Button, SimpleGrid, Dialog, Portal, CloseButton
} from "@chakra-ui/react";
import NextLink from 'next/link';
import { AuthWrapper } from "@/components/auth-wrapper";
import { useAuth } from "@/lib/auth-context.tsx";
import {InfoTip} from "@/components/ui/toggle-tip.tsx";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FiDatabase } from "react-icons/fi";
import { TbPlaylistAdd } from "react-icons/tb";
import { LuClapperboard } from "react-icons/lu";
import { MdOutlineScoreboard } from "react-icons/md";
import { MdOutlineAdminPanelSettings } from "react-icons/md";
import { IoPeopleOutline } from "react-icons/io5";
import React, {useEffect, useState} from "react";
import {getPlayerPointsPlayed, PointsByPlayer} from "@/app/players/supabase.ts";
import {getPlayerStatsFromPossessions, PlayerStats} from "@/app/players/utils.ts";
import {fetchAllPointsDetailed} from "@/app/points/supabase.ts";
import OnPageVideoLink from "@/components/on-page-video-link.tsx";

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

interface HorizontalMenuItem {
  title: string;
  href: string;
  iconComponent: React.ElementType;
}

function HorizontalIconMenu({ menuItems }: { menuItems: HorizontalMenuItem[] }) {
  return (
    <Box
      overflowX="auto"
      pb={2}
      width="100%"
    >
      <HStack
        gap={3}
        px={2}
      >
        {menuItems.map((item) => (
          <ChakraLink
            key={item.href}
            as={NextLink}
            href={item.href}
            _hover={{ textDecoration: 'none' }}
            _focus={{ boxShadow: "none", outline: "none" }}
            flexShrink={0}
          >
            <VStack
              w="120px"
              h="120px"
              justifyContent="center"
              alignItems="center"
              gap={1}
              bg="transparent"
              _hover={{ bg: "whiteAlpha.100", rounded: "md" }}
              transition="background-color 0.2s ease-in-out"
              rounded="md"
            >
              <Icon as={item.iconComponent} boxSize="30px" color="white" />
              <Text fontSize="xs" color="white" textAlign="center">
                {item.title}
              </Text>
            </VStack>
          </ChakraLink>
        ))}
      </HStack>
    </Box>
  );
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
      <Box minH="100vh" bg="gray.900" p={4} display="flex" alignItems="center" justifyContent="center">
        <Text color="white">Loading player data...</Text>
      </Box>
    );
  }

  // Menu items
  const menuItems: HorizontalMenuItem[] = [
    { title: "Sources", href: "/sources", iconComponent: FiDatabase },
    { title: "Events", href: "/events", iconComponent: FaRegCalendarAlt },
    { title: "Playlists", href: "/playlists", iconComponent: TbPlaylistAdd },
    { title: "Clips", href: "/clips", iconComponent: LuClapperboard },
    { title: "Points", href: "/points", iconComponent: MdOutlineScoreboard },
    { title: "Teams", href: "/teams", iconComponent: IoPeopleOutline },
    ...(player.is_admin ? [{ title: "Admin", href: "/players", iconComponent: MdOutlineAdminPanelSettings }] : []),
  ];

  const turns = (playerStats?.drops ?? 0) + (playerStats?.throwaways ?? 0);
  const pointsPlayed = playerPoints.length


  return (
    <Container maxW="4xl">
      <Heading as="h1" fontWeight="light" size='4xl' color="white" mb={4} mt={4}>
        Hello, {player.player_name}
      </Heading>
      <HorizontalIconMenu menuItems={menuItems}></HorizontalIconMenu>
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
            </Card.Header>
            <Card.Body>
              <Text color={item.outcome === "break" ? "red.400" : "green.400"}>
                Offence Team: {item.point_offence_team_name}
              </Text>
            </Card.Body>
            <Card.Footer gap="2">
              <NextLink href={`/events/${item.event_id}/${item.point_id}/view`} passHref>
                <Button as="a" variant="solid">
                  View
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

