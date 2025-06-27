"use client";

import React from "react";
import {
  Box,
  Container,
  Separator,
  Text,
  useDisclosure
} from "@chakra-ui/react";
import { fetchClipsCustom } from "@/app/clips/supabase";
import {fetchPlaylist} from "@/app/playlists/supabase";
import FloatingActionButton from "@/components/ui/floating-plus";
import {useParams} from "next/navigation";
import {useAuth} from "@/lib/auth-context.tsx";
import {AuthWrapper} from "@/components/auth-wrapper.tsx";
import StandardHeader from "@/components/standard-header.tsx";
import {useQuery} from "@tanstack/react-query";
import {AddClipModal} from "@/app/clips/components/add-clip-modal.tsx";
import {ClipGrid} from "@/app/clips/components/clip-grid.tsx";



function PointPageContent() {
  const { playlist_id } = useParams<{ playlist_id: string }>();
  const { player } = useAuth();
  const { open, onOpen, onClose } = useDisclosure();

  // Fetch playlist info
  const { data: playlist, isLoading: isPlaylistLoading } = useQuery({
    queryKey: ['playlist', playlist_id],
    queryFn: () => fetchPlaylist(playlist_id),
    enabled: !!playlist_id,
  });

  // Fetch clips
  const { data: clips, isLoading: isClipLoading } = useQuery({
    queryKey: ["clips", { playlist: playlist_id, requestPlayerId: player?.auth_user_id }],
    queryFn: () => fetchClipsCustom({
      playlist: playlist_id,
      requestPlayer: player!.auth_user_id
    }),
    enabled: !!playlist_id && !!player,
  });

  const isLoading = isClipLoading || isPlaylistLoading;

  if (!player || isLoading) {
    return (
      <Box minH="100vh" p={4} display="flex" alignItems="center" justifyContent="center">
        <Text color="white" fontSize="lg">Loading player data...</Text>
      </Box>
    )
  }

  if (!clips) {
    return (
      <Box minH="100vh" p={4} display="flex" alignItems="center" justifyContent="center">
        <Text color="white" fontSize="lg">No clips on this playlist yet.</Text>
      </Box>
    )
  }

  return (
    <Container maxW="4xl">
      <StandardHeader text={playlist?.title || ""} is_admin={player.is_admin} />
      <Text textStyle="xl" mb={4} mt ={4}>{playlist?.description}</Text>
      <Separator mb={8} />
      <ClipGrid clips={clips ?? []} playerId={player.player_id}/>
      <FloatingActionButton onClick={onOpen} iconType = "clip"/>
      <AddClipModal
        isOpen={open}
        onClose={onClose}
        playerId={player.player_id}
        playlists={[playlist_id]}
        mode="add"
      />
    </Container>
  );
}

export default function PointPage() {
  return (
    <AuthWrapper>
      <PointPageContent />
    </AuthWrapper>
  )
}
