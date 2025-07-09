"use client"

import {useAuth} from "@/lib/auth-context.tsx";
import {Box, Container, Text} from "@chakra-ui/react";
import {useQuery} from "@tanstack/react-query";
import {AuthWrapper} from "@/components/auth-wrapper.tsx";
import React from "react";
import {fetchScrapedPlayers} from "@/app/playerSearch/supabase.ts";
import StandardHeader from "@/components/standard-header.tsx";

function PlayerSearchContent() {
  const {player} = useAuth()
  // const {open, onOpen, onClose} = useDisclosure();

  const {data: searchPlayerData, isLoading} = useQuery({
    queryFn: () => fetchScrapedPlayers(),
    queryKey: ["searchPlayers"]
  })

  if (!player || isLoading) {
    return (
      <Box minH="100vh" p={4} display="flex" alignItems="center" justifyContent="center">
        <Text color="white" fontSize="lg">Loading team data...</Text>
      </Box>
    );
  }
  if (!searchPlayerData) {
    return (
      <Container maxW="4xl">
        <StandardHeader text="Teams" is_admin={player.is_admin} />
        <Text color="white" fontSize="lg">No data.</Text>
      </Container>
    )
  }

  return (
    <Container maxW="4xl">
      <StandardHeader text="Search for players" is_admin={player.is_admin} />
      {/*<Table></Table>*/}
    </Container>
  )
}

export default function PlayerSearchPage() {
  return (
    <AuthWrapper>
      <PlayerSearchContent />
    </AuthWrapper>
  )
}
