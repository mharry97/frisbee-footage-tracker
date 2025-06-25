"use client"
import NextLink from "next/link";
import {
  Container,
  Box, Text, Card, Dialog, Button, SimpleGrid, useDisclosure, Badge, HStack
} from "@chakra-ui/react";
import React from "react";
import { AddPlaylistModal } from "@/app/playlists/components/add-playlist-modal";
import FloatingActionButton from "@/components/ui/floating-plus";
import { fetchVisiblePlaylists } from "@/app/playlists/supabase";
import {AuthWrapper} from "@/components/auth-wrapper";
import {useAuth} from "@/lib/auth-context.tsx";
import StandardHeader from "@/components/standard-header.tsx";
import { useQuery } from "@tanstack/react-query";

function PlaylistsPageContent() {
  const { player } = useAuth();
  const { open, onOpen, onClose } = useDisclosure();


  const { data: playlists, isLoading } = useQuery({
    queryKey: ["playlists", player?.auth_user_id],
    queryFn: () => fetchVisiblePlaylists(player!.auth_user_id),
    enabled: !!player
  })

  if (!player || isLoading) {
    return (
      <Box minH="100vh" p={4} display="flex" alignItems="center" justifyContent="center">
        <Text color="white" fontSize="lg">Loading data...</Text>
      </Box>
    )
  }

  if (!playlists) {
    return (
      <Box minH="100vh" p={4} display="flex" alignItems="center" justifyContent="center">
        <Text color="white" fontSize="lg">No playlists added yet.</Text>
      </Box>
    )
  }

  return (
    <>
      <Container maxW="4xl">
        <StandardHeader text="Playlists" is_admin={player.is_admin} />
        <SimpleGrid columns={{base: 1, md: 2}} gap={8} mb={8}>
          {playlists.map((item) => (
            <Card.Root key={item.playlist_id} variant="elevated">
              <Card.Header>
                <HStack justify='space-between'>
                  <Card.Title>{item.title}</Card.Title>
                  <Card.Title>
                    {!item.is_public && (<Badge colorPalette="green">Private</Badge>)}
                  </Card.Title>
                </HStack>
                <Card.Description>
                  Created by {item.created_by_name} on {new Intl.DateTimeFormat('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                }).format(new Date(item.created_at))}
                </Card.Description>
              </Card.Header>
              <Card.Body>
                <Card.Description mb={2}>
                  {item.description}
                </Card.Description>
              </Card.Body>
              <Card.Footer gap="2">
                <Dialog.Root size="xl">
                  <Dialog.Trigger asChild>
                    <NextLink href={`/playlists/${item.playlist_id}`} passHref>
                      <Button colorPalette='gray'>View Playlist</Button>
                    </NextLink>
                  </Dialog.Trigger>
                </Dialog.Root>
              </Card.Footer>
            </Card.Root>
          ))}
        </SimpleGrid>
        <FloatingActionButton onClick={onOpen} iconType="add" />
        <AddPlaylistModal
          isOpen={open}
          onClose={onClose}
        />
      </Container>
    </>
  );
}

export default function PlaylistsPage() {
  return (
    <AuthWrapper>
      <PlaylistsPageContent />
    </AuthWrapper>
  )
}
