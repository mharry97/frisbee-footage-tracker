"use client"
import { Container, Box, Heading, Text } from "@chakra-ui/react";
import { MenuGrid } from "@/app/login/components/menu-grid";
import { useRequireAuth } from "@/lib/auth-context"
import {AuthWrapper} from "@/components/auth-wrapper";

function HomepageContent() {
  const { player, loading } = useRequireAuth()

  if (loading) {
    return (
      <Box minH="100vh" bg="black" p={4} display="flex" alignItems="center" justifyContent="center">
        <Text color="white">Loading...</Text>
      </Box>
    )
  }

  if (!player) {
    return null
  }

  const menuItems = [
    { title: "Sources", icon: "database", href: "/sources" },
    { title: "Events", icon: "calendar", href: "/events" },
    { title: "Clips", icon: "film", href: "/clips" },
    { title: "Points", icon: "scoreboard", href: "/points" },
    { title: "Stats", icon: "bar-chart", href: "/stats" },
    { title: "Playlists", icon: "playlist", href: "/playlists" },
    ...(player.is_admin ? [{ title: "Players", icon: "users", href: "/players" }] : []),
  ];

  return (
    <Box minH="100vh" bg="black" p={4}>
      <Container maxW="4xl">
        <Heading as="h1" size="4xl" fontWeight="light" color="white" mb={8} mt={4}>
          Hello, {player.username}
        </Heading>
        <MenuGrid items={menuItems} />
      </Container>
    </Box>
  );
}

export default function Homepage() {
  return (
    <AuthWrapper>
      <HomepageContent />
    </AuthWrapper>
  )
}
