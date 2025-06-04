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
  Card, Button, SimpleGrid
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
import React from "react";

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

interface PointCard {
  title: string;
  timestamp: string;
  offence_team: string;
  outcome: string;
  url: string;
}

// Menu items
const menuItems: HorizontalMenuItem[] = [
  { title: "Sources", href: "/sources", iconComponent: FiDatabase },
  { title: "Events", href: "/events", iconComponent: FaRegCalendarAlt },
  { title: "Playlists", href: "/playlists", iconComponent: TbPlaylistAdd },
  { title: "Clips", href: "/clips", iconComponent: LuClapperboard },
  { title: "Points", href: "/points", iconComponent: MdOutlineScoreboard },
  { title: "Admin", href: "/players", iconComponent: MdOutlineAdminPanelSettings },
  { title: "Teams", href: "/teams", iconComponent: IoPeopleOutline },
];

const pointCards: PointCard[] = [
  { title: "Solent Scrims - Solent", timestamp: "102:36", offence_team: "Smash'D", outcome: "break", url: "" },
  { title: "Solent Scrims - Solent", timestamp: "105:21", offence_team: "Smash'D", outcome: "score", url: "" },
  { title: "Solent Scrims - Solent", timestamp: "107:51", offence_team: "Solent", outcome: "break", url: ""  },
  { title: "Solent Scrims - Solent", timestamp: "109:16", offence_team: "Solent", outcome: "break", url: ""  },
]

export function HorizontalIconMenu() {
  return (
    <Box
      overflowX="auto"
      pb={2}
      width="100%"
    >
      <HStack
        spacing={3}
        px={2}
        justifyContent={{ base: "flex-start", md: "center" }}
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
              spacing={1}
              bg="transparent"
              _hover={{ bg: "whiteAlpha.100", rounded: "md" }}
              transition="background-color 0.2s ease-in-out"
              rounded="md"
            >
              <Icon as={item.iconComponent} boxSize="30px" color="white" />
              <Text fontSize="xs" color="white" textAlign="center" noOfLines={1}>
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

  if (!player) {
    return (
      <Box minH="100vh" bg="gray.900" p={4} display="flex" alignItems="center" justifyContent="center">
        <Text color="white">Loading player data or not authenticated...</Text>
      </Box>
    );
  }


  return (
    <Container maxW="4xl">
      <Heading as="h1" fontWeight="light" size='4xl' color="white" mb={4} mt={4}>
        Hello, {player.player_name}
      </Heading>
      <HorizontalIconMenu></HorizontalIconMenu>
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
          value={8}
          // help="(Scores+Assists+Ds)-Turns" Currently throws off alignment
        />
        <StatTile
          title="Points Played"
          value={8}
        />
        <StatTile
          title="Scores"
          value={8}
        />
        <StatTile
          title="Assists"
          value={8}
        />
        <StatTile
          title="Ds"
          value={8}
        />
        <StatTile
          title="Turns"
          value={8}
        />
      </Box>
      <HStack mb={6}>
        <Separator flex="1" size="sm" colorPalette='yellow'></Separator>
        <Text flexShrink="0" fontSize="xl" >Points</Text>
        <Separator flex="1" size="sm" colorPalette='yellow'></Separator>
      </HStack>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={8}>
        {pointCards.map((item, index) => (
          <Card.Root key={index} variant="elevated">
            <Card.Header>
              <Card.Title>{item.title}</Card.Title>
              <Card.Description>{item.timestamp}</Card.Description>
            </Card.Header>
            <Card.Body>
              <Text color={item.outcome === "break" ? "red.400" : "green.400"}>
                Offence Team: {item.offence_team}
              </Text>
            </Card.Body>
            <Card.Footer gap="2">
              <Button variant="solid">View</Button>
              <Button variant="ghost">Quick View</Button>
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
