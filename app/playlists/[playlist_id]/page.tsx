"use client";

import React from "react";
import {
  Box, Button, Card, CloseButton,
  Container, Dialog, Portal, Separator, SimpleGrid,
  Text, useDisclosure
} from "@chakra-ui/react";
import { fetchPlaylistClips } from "@/app/clips/supabase";
import {fetchPlaylist} from "@/app/playlists/supabase";
import FloatingClipButton from "@/components/ui/add-clip-button";
import {useParams} from "next/navigation";
import {useAuth} from "@/lib/auth-context.tsx";
import {AuthWrapper} from "@/components/auth-wrapper.tsx";
import StandardHeader from "@/components/standard-header.tsx";
import {useQuery} from "@tanstack/react-query";
import OnPageVideoLink from "@/components/on-page-video-link.tsx";
import {baseUrlToTimestampUrl} from "@/lib/utils.ts";
import {AddClipModal} from "@/app/clips/components/add-clip-modal.tsx";



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
  const { data: clips, isLoading:isClipLoading } = useQuery({
    queryKey: ["clips", playlist_id, player?.player_id],
    queryFn: () => fetchPlaylistClips(playlist_id, player!.player_id),
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
      <Separator />
      <SimpleGrid columns={{base: 1, md: 2}} gap={8} mb={8}>
        {clips.map((item) => (
          <Card.Root key={item.clip_id} variant="elevated">
            <Card.Header>
              <Card.Title>{item.title}</Card.Title>
            </Card.Header>
            <Card.Body>
              <Card.Description>
                {item.description}
              </Card.Description>
            </Card.Body>
            <Card.Footer gap="2">
              <Dialog.Root size="xl">
                <Dialog.Trigger asChild>
                  <Button colorPalette='gray'>View Clip</Button>
                </Dialog.Trigger>
                <Portal>
                  <Dialog.Backdrop/>
                  <Dialog.Positioner>
                    <Dialog.Content>
                      <Dialog.Body>
                        <OnPageVideoLink url={baseUrlToTimestampUrl(item.url, item.timestamp)}/>
                      </Dialog.Body>
                      <Dialog.CloseTrigger asChild>
                        <CloseButton size="sm"/>
                      </Dialog.CloseTrigger>
                    </Dialog.Content>
                  </Dialog.Positioner>
                </Portal>
              </Dialog.Root>
            </Card.Footer>
          </Card.Root>
        ))}
      </SimpleGrid>
      <FloatingClipButton onClick={onOpen} />
      <AddClipModal
        isOpen={open}
        onClose={onClose}
        playerId={player.player_id}
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
