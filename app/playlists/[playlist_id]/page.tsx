"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Container, Separator,
  Text
} from "@chakra-ui/react";
import type { Playlist } from "@/lib/supabase";
import { Clip } from "@/app/clips/supabase.ts"
import { fetchPlaylistClips } from "@/app/clips/supabase";
import {ClipGrid} from "@/app/clips/components/clip-grid";
import {fetchPlaylist} from "@/app/playlists/supabase";
import {AddSourceClipModal} from "@/app/clips/components/add-clip-from-source";
import FloatingClipButton from "@/components/ui/add-clip-button";
import {useParams} from "next/navigation";
import {useAuth} from "@/lib/auth-context.tsx";
import {AuthWrapper} from "@/components/auth-wrapper.tsx";
import StandardHeader from "@/components/standard-header.tsx";



function PointPageContent() {
  // Unwrap the promised params
  const { playlist_id } = useParams<{ playlist_id: string }>();
  const { player } = useAuth();
  const [loading, setLoading] = useState(true);
  const [clips, setClips] = useState<Clip[]>([]);
  const [playlistData, setPlaylistData] = useState<Playlist | null>(null);
  const [isClipModalOpen, setIsClipModalOpen] = useState(false);

  // Fetch data needed for page
  useEffect(() => {
    if (!playlist_id) return;

    (async () => {
      try {
        const clips = await fetchPlaylistClips(playlist_id);
        setClips(clips);

        const playlistData = await fetchPlaylist(playlist_id);
        setPlaylistData(playlistData);


      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [playlist_id]);

  if (!player || loading) {
    return (
      <Box minH="100vh" p={4} display="flex" alignItems="center" justifyContent="center">
        <Text color="white" fontSize="lg">Loading player data...</Text>
      </Box>
    )
  }

  return (
    <Container maxW="4xl">
      <StandardHeader text={playlistData?.title || ""} is_admin={player.is_admin} />
      <Text textStyle="xl" mb={4} mt ={4}>{playlistData?.description}</Text>
      <Separator />
      <ClipGrid clips={clips}></ClipGrid>
      <FloatingClipButton onClick={() => setIsClipModalOpen(true)} />
      <AddSourceClipModal
        isOpen={isClipModalOpen}
        onClose={() => setIsClipModalOpen(false)}
        playlistId={playlist_id}
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
