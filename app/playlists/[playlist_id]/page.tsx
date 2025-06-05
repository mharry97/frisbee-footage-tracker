"use client";

import React, { useEffect, useState } from "react";
import {
  Container, Separator,
  Text
} from "@chakra-ui/react";
import Header from "@/components/header";
import type {Clip, Playlist} from "@/lib/supabase";
import { fetchPlaylistClips } from "@/app/clips/supabase";
import {ClipGrid} from "@/app/clips/components/clip-grid";
import {fetchPlaylist} from "@/app/playlists/supabase";
import LoadingSpinner from "@/components/ui/loading-spinner";
import {AddSourceClipModal} from "@/app/clips/components/add-clip-from-source";
import FloatingClipButton from "@/components/ui/add-clip-button";
import {AuthWrapper} from "@/components/auth-wrapper";



export default function PointPage({
                                    params,
                                  }: {
  params: Promise<{ playlist_id: string }>;
}) {
  // Unwrap the promised params
  const { playlist_id } = React.use(params);
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

  return (
    <AuthWrapper>
      <Container maxW="4xl">
        {loading ? (
          <LoadingSpinner text="Loading info" />
        ) : (
          <>
            <Header title={playlistData?.title || ""} buttonText="Playlists" redirectUrl="/playlists"/>
            <Text textStyle="xl" mb={4} mt ={4}>{playlistData?.description}</Text>
            <Separator />
            <ClipGrid clips={clips}></ClipGrid>
            <FloatingClipButton onClick={() => setIsClipModalOpen(true)} />
            <AddSourceClipModal
              isOpen={isClipModalOpen}
              onClose={() => setIsClipModalOpen(false)}
              playlistId={playlist_id}
            />
          </>
        )}
      </Container>
    </AuthWrapper>
  );
}
