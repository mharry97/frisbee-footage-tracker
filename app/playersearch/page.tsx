"use client"

import {useAuth} from "@/lib/auth-context.tsx";
import dynamic from 'next/dynamic';
import {Box, Container, Text, useDisclosure} from "@chakra-ui/react";
import {useQuery} from "@tanstack/react-query";
import {AuthWrapper} from "@/components/auth-wrapper.tsx";
import React, {useState} from "react";
import {fetchScrapedPlayers, SearchPlayer} from "@/app/playersearch/supabase.ts";
import StandardHeader from "@/components/standard-header.tsx";
import {PlayerModal} from "@/app/players/components/player-modal.tsx";
import LoadingSpinner from "@/components/ui/loading-spinner.tsx";
const PlayerSearchTable = dynamic(
  () => import('@/app/playersearch/components/player-search-table').then((mod) => mod.PlayerSearchTable),
  {
    ssr: false, // Disables server-side rendering for this component
    loading: () => <LoadingSpinner text="Loading table..." />,
  }
);

function PlayerSearchContent() {
  const {player} = useAuth()
  const { open, onOpen, onClose } = useDisclosure();
  const [selectedPlayer, setSelectedPlayer] = useState<SearchPlayer | null>(null);

  const {data: searchPlayerData, isLoading} = useQuery({
    queryFn: () => fetchScrapedPlayers(),
    queryKey: ["searchPlayers"]
  })

  // Open modal on row click
  const handleRowClick = (scrapedPlayer: SearchPlayer) => {
    setSelectedPlayer(scrapedPlayer);
    onOpen(); // Open the modal
  };

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
      <PlayerSearchTable
        data={searchPlayerData}
        onRowClick={handleRowClick}
      />
      {selectedPlayer && (
        <PlayerModal
          key={selectedPlayer.unique_player_id}
          isOpen={open}
          onClose={onClose}
          mode="add"
          playerName={selectedPlayer.event_player_name}
          playerNumber={selectedPlayer.event_player_number}
        />
      )}
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
