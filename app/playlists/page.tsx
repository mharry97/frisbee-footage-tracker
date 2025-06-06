"use client"
import NextLink from "next/link";
import {
  Container,
  Table,
  LinkOverlay,
  LinkBox, Box, Text
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { AddPlaylistModal } from "@/app/playlists/components/add-playlist-modal";
import FloatingActionButton from "@/components/ui/plus-button";
import {fetchPlaylists, PlaylistWithCreator} from "@/app/playlists/supabase";
import {AuthWrapper} from "@/components/auth-wrapper";
import {useAuth} from "@/lib/auth-context.tsx";
import StandardHeader from "@/components/standard-header.tsx";

function PlaylistsPageContent() {
  const { player } = useAuth();
  const [loading, setLoading] = useState(true);
  const [playlists, setPlaylists] = useState<PlaylistWithCreator[]>([]);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);


  const loadPlaylists = async () => {
    setLoading(true);
    const playlists = await fetchPlaylists();
    setPlaylists(playlists);
    setLoading(false);
  };

  useEffect(() => {
    void loadPlaylists();
  }, []);

  if (!player || loading) {
    return (
      <Box minH="100vh" p={4} display="flex" alignItems="center" justifyContent="center">
        <Text color="white" fontSize="lg">Loading player data...</Text>
      </Box>
    )
  }

  return (
    <>
      <Container maxW="4xl">
        <StandardHeader text="Playlists" is_admin={player.is_admin} />
        <Table.Root
          size="lg"
          interactive
        >
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Playlist</Table.ColumnHeader>
              <Table.ColumnHeader width="35%" textAlign="right">Creator</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {playlists.map((playlist) => (
              <Table.Row key={playlist.playlist_id}>
                <Table.Cell>
                  <LinkBox as="div">
                    <LinkOverlay as={NextLink} href={`/playlists/${playlist.playlist_id}`}>
                      {playlist.title}
                    </LinkOverlay>
                  </LinkBox>
                </Table.Cell>
                <Table.Cell width="35%" textAlign="right">{playlist.creator.player_name}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Container>
      <FloatingActionButton aria-label="Add Playlist" onClick={() => setIsPlaylistModalOpen(true)} />
      <AddPlaylistModal
        isOpen={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
      />
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
