"use client";

import {
  Box,
  Container,
  Text
} from "@chakra-ui/react";
import { useAuth } from "@/lib/auth-context";
import StandardHeader from "@/components/standard-header.tsx";

export default function PlayersPage() {
  const { player } = useAuth();


  if (!player) return (
    <Box minH="100vh" p={4} display="flex" alignItems="center" justifyContent="center">
      <Text color="white" fontSize="lg">Loading team data...</Text>
    </Box>
  );

  return (
    <Container maxW="4xl" py={8}>
      <StandardHeader text="Clips" is_admin={player.is_admin} />
      <Text>Still working this bit out</Text>
    </Container>
  );
}
