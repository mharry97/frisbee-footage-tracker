"use client";

import {Box, Container, Text, useDisclosure} from "@chakra-ui/react";
import {AuthWrapper} from "@/components/auth-wrapper.tsx";
import React from "react";
import {useAuth} from "@/lib/auth-context.tsx";
import StandardHeader from "@/components/standard-header.tsx";
import {useParams} from "next/navigation";
import {useQuery} from "@tanstack/react-query";
import {fetchPlayer} from "@/app/players/supabase.ts";
import CustomTabs from "@/components/tabbed-page.tsx";
import LoadingSpinner from "@/components/ui/loading-spinner.tsx";
import {ClipGrid} from "@/app/clips/components/clip-grid.tsx";
import {fetchClipsCustom} from "@/app/clips/supabase.ts";
import {PlayerModal} from "@/app/players/components/player-modal.tsx";
import FloatingPlusButton from "@/components/ui/floating-plus.tsx";


function PlayerPageContent() {
  const { player } = useAuth();
  const { player_id } = useParams<{ player_id: string }>();
  const { open, onOpen, onClose } = useDisclosure();

  const { data: playerData, isLoading } = useQuery({
    queryFn: () => fetchPlayer(player_id),
    queryKey: ["player", player_id],
    enabled: !!player_id,
  })

  if (!player || !playerData || isLoading) {
    return (
      <Box minH="100vh" p={4} display="flex" alignItems="center" justifyContent="center">
        <Text color="white" fontSize="lg">Loading data...</Text>
      </Box>
    )
  }

  // OVERVIEW
  const OverviewContent = () => {
    return (
      <>
        <Text mb={4} mt={4} textStyle="2xl">Player level stats - not dissimilar to homepage i think</Text>
        <FloatingPlusButton onClick={onOpen} iconType="edit" />
        <PlayerModal
          isOpen={open}
          onClose={onClose}
          mode="edit"
          playerToEdit={playerData}
        />
      </>
    )
  }

  // INFO
  const InfoContent = () => {
    return (
      <>
        <Text mb={4} mt={4} textStyle="2xl">General information on how to play against them, notes etc.</Text>
      </>
    );
  }

  // CLIPS
  const ClipsContent = () => {
    const { data: clips, isLoading } = useQuery({
      queryKey: ["playerClips", { clipPlayer: player_id, requestPlayer: player?.auth_user_id }],
      queryFn: () => fetchClipsCustom({
        clipPlayer: player_id,
        requestPlayer: player!.auth_user_id
      }),
      enabled: !!player_id && !!player,
    });
    if (isLoading) {
      return <LoadingSpinner text="Loading clips..." />;
    }
    return <ClipGrid clips={clips ?? []} />;
  };

  const tabs = [
    {
      value: "overview",
      label: "Overview",
      content: <OverviewContent />,
    },
    {
      value: "info",
      label: "Info",
      content: <InfoContent />,
    },
    {
      value: "clips",
      label: "Clips",
      content: <ClipsContent />,
    },
  ];

  return (
    <Container maxW="4xl">
      <StandardHeader text={`${playerData.team_name} - ${playerData.player_name}`} is_admin={player.is_admin} />
      <CustomTabs defaultValue="overview" tabs={tabs} />
    </Container>
  )
}


export default function PlayerPage() {
  return (
    <AuthWrapper>
      <PlayerPageContent />
    </AuthWrapper>
  )
}
