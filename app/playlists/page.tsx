"use client"
import NextLink from "next/link";
import {
  Container,
  Table,
  LinkOverlay,
  LinkBox
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import Header from "@/components/header";
import { AddPlaylistModal } from "@/app/playlists/components/add-playlist-modal";
import LoadingSpinner from "@/components/ui/loading-spinner";
import FloatingActionButton from "@/components/ui/plus-button";
import {fetchPlaylists} from "@/app/playlists/supabase";

export default function PlaylistsPage() {
  const [loading, setLoading] = useState(true);
  const [playlists, setPlaylists] = useState([]);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);


  const loadPlaylists = async () => {
    setLoading(true);
    const playlists = await fetchPlaylists();
    setPlaylists(playlists);
    setLoading(false);
  };

  useEffect(() => {
    loadPlaylists();
  }, []);

  return (
    <>
      <Container maxW="4xl">
        <Header title="playlists" buttonText="dashboard" redirectUrl="/dashboard" />
        {loading ? (
          <LoadingSpinner text="loading playlists..." />
        ) : (
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
        )}
      </Container>
      <FloatingActionButton aria-label="Add Playlist" onClick={() => setIsPlaylistModalOpen(true)} />
      <AddPlaylistModal
        isOpen={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
      />
    </>
  );
}
