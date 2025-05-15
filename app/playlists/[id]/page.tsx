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



export default function PointPage({
                                    params,
                                  }: {
  params: Promise<{ id: string }>;
}) {
  // Unwrap the promised params
  const { id } = React.use(params);
  const [loading, setLoading] = useState(true);
  const [clips, setClips] = useState<Clip[]>([]);
  const [playlistData, setPlaylistData] = useState<Playlist>();

  // Fetch data needed for page
  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const clips = await fetchPlaylistClips(id);
        setClips(clips);

        const playlistData = await fetchPlaylist(id);
        setPlaylistData(playlistData);


      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <Container maxW="4xl">
      <Header title={playlistData?.title || ""} buttonText="dashboard" redirectUrl="/dashboard"/>
      <Text textStyle="xl" mb={4} mt ={4}>{playlistData?.description}</Text>
      <Separator />
      <ClipGrid clips={clips}></ClipGrid>
    </Container>
  );
}
