"use client";

import React, { useState } from "react";
import { fetchClipsCustom } from "@/app/clips/supabase";
import { fetchPlaylist } from "@/app/playlists/supabase";
import FloatingActionButton from "@/components/ui/floating-plus";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context.tsx";
import { AuthWrapper } from "@/components/auth-wrapper.tsx";
import StandardHeader from "@/components/standard-header.tsx";
import { useQuery } from "@tanstack/react-query";
import { AddClipModal } from "@/app/clips/components/add-clip-modal.tsx";
import { ClipGrid } from "@/app/clips/components/clip-grid.tsx";

function PointPageContent() {
  const { playlist_id } = useParams<{ playlist_id: string }>();
  const { player } = useAuth();
  const [open, setOpen] = useState(false);

  const { data: playlist, isLoading: isPlaylistLoading } = useQuery({
    queryKey: ['playlist', playlist_id],
    queryFn: () => fetchPlaylist(playlist_id),
    enabled: !!playlist_id,
  });

  const { data: clips, isLoading: isClipLoading } = useQuery({
    queryKey: ["clips", { playlist: playlist_id, requestPlayerId: player?.auth_user_id }],
    queryFn: () => fetchClipsCustom({
      playlist: playlist_id,
      requestPlayer: player!.auth_user_id
    }),
    enabled: !!playlist_id && !!player,
  });

  if (!player || isClipLoading || isPlaylistLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    )
  }

  return (
    <div>
      <StandardHeader text={playlist?.title || ""} />
      <p className="text-xl mb-4 mt-4">{playlist?.description}</p>
      <hr className="border-neutral-700 mb-8" />
      <ClipGrid clips={clips ?? []} playerId={player.player_id} />
      <FloatingActionButton onClick={() => setOpen(true)} iconType="clip" />
      <AddClipModal
        isOpen={open}
        onClose={() => setOpen(false)}
        playerId={player.player_id}
        playlists={[playlist_id]}
        mode="add"
      />
    </div>
  );
}

export default function PointPage() {
  return (
    <AuthWrapper>
      <PointPageContent />
    </AuthWrapper>
  )
}
