"use client"
import {
  Container,
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Link as ChakraLink, Icon
} from "@chakra-ui/react";
import NextLink from 'next/link';
import { AuthWrapper } from "@/components/auth-wrapper";
import { useAuth } from "@/lib/auth-context.tsx";
import {InfoTip} from "@/components/ui/toggle-tip.tsx";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FiDatabase } from "react-icons/fi";
import { TbPlaylistAdd } from "react-icons/tb";

interface StatTileProps {
  title: string;
  value: number;
  help?: string;
}

function StatTile({ title, value, help }: StatTileProps) {
  return (
    <Box
      rounded="xl"
      width={120}
      height={120}
      shadow={"lg"}
    >
      <VStack>
        <Text mt={2}>
          {title}
          {help && <InfoTip>{help}</InfoTip>}
        </Text>
        <Text mt={2} color="yellow.400" fontSize="3xl">
          {value}
        </Text>
      </VStack>
    </Box>
  )
}

interface HorizontalMenuItem {
  title: string;
  href: string;
  iconComponent: React.ElementType; // Type for react-icons components
}

// Define your menu items
const menuItems: HorizontalMenuItem[] = [
  { title: "Events", href: "/events", iconComponent: FaRegCalendarAlt },
  { title: "Playlists", href: "/playlists", iconComponent: TbPlaylistAdd },
  { title: "Sources", href: "/sources", iconComponent: FiDatabase },
];

export function HorizontalIconMenu() {
  return (
    <Box
      overflowX="auto"
      pb={2} // Padding at the bottom to make space for scrollbar if it appears
      // Remove background if you want it truly invisible, or use a subtle one from your theme
      // bg="gray.800"
      // borderRadius="md"
      // borderWidth="1px"
      // borderColor="gray.700"
      width="100%" // Ensure it takes available width to allow scrolling content
    >
      <HStack
        spacing={3}
        justifyContent={{ base: "flex-start", md: "center" }} // Center on larger screens if not enough items to scroll
        px={2} // Padding inside the scrollable area
      >
        {menuItems.map((item) => (
          <ChakraLink
            key={item.href}
            as={NextLink}
            href={item.href}
            _hover={{ textDecoration: 'none' }}
            flexShrink={0} // Prevent items from shrinking when space is tight before scrolling kicks in
          >
            <VStack
              w="120px"
              h="120px"
              justifyContent="center"
              alignItems="center"
              spacing={1}
              bg="transparent" // Invisible box as requested
              _hover={{ bg: "whiteAlpha.100", rounded: "md" }}
              transition="background-color 0.2s ease-in-out"
              p={2} // Padding for content within the clickable area
              rounded="md" // Initial rounding for consistency with hover
            >
              <Icon as={item.iconComponent} boxSize="32px" color="white" />
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
    <Container>
      <Heading as="h1" fontWeight="light" size='4xl' color="white" mb={8} mt={4}>
        Hello, {player.username}
      </Heading>
      <HorizontalIconMenu></HorizontalIconMenu>
      <Box>
        <HStack>

        </HStack>
      </Box>
      <Box
         width={600}
      >
        <VStack pt={10} pb={10} >
          <Box
            rounded="xl"
            width={580}
            height={120}
            shadow={"lg"}
          >
            <HStack>
              <Text mt={2}>
                Overall +/-
                <InfoTip>(Scores+Assists+Ds)-(Throwing Errors+Drops)</InfoTip>
              </Text>
              <Text mt={2} color="yellow.400" fontSize="3xl">
                24
              </Text>
            </HStack>
          </Box>
          <Box
            rounded="xl"
            width={580}
            height={120}
            shadow={"lg"}
          >
            <HStack>
              <Text mt={2}>
                Points Played
              </Text>
              <Text mt={2} color="yellow.400" fontSize="3xl">
                24
              </Text>
            </HStack>
          </Box>
          <HStack justify="space-between" gap={7}>
            <StatTile
              title="Scores"
              value={8}
            />
            <StatTile
              title="Assist"
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
          </HStack>
        </VStack>
      </Box>
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
