"use client"

import { Container, Box, Heading, Text } from "@chakra-ui/react";
import { MenuGrid } from "@/app/dashboard/components/menu-grid";
import { useRequireAuth } from "@/lib/auth-context"

export default function DashboardPage() {
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
    { title: "sources", icon: "database", href: "/sources" },
    { title: "events", icon: "calendar", href: "/events" },
    { title: "clips", icon: "film", href: "/clips" },
    { title: "points", icon: "scoreboard", href: "/points" },
    { title: "stats", icon: "bar-chart", href: "/stats" },
    { title: "playlists", icon: "playlist", href: "/playlists" },
    ...(player.is_admin ? [{ title: "users", icon: "users", href: "/users" }] : []),
  ];

  return (
    <Box minH="100vh" bg="black" p={4}>
      <Container maxW="4xl">
        <Heading as="h1" size="4xl" fontWeight="light" color="white" mb={8} mt={4}>
          footage tracker
        </Heading>
        <MenuGrid items={menuItems} />
      </Container>
    </Box>
  );
}
