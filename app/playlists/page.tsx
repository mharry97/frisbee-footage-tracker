"use client"

import NextLink from "next/link"
import { useState } from "react"
import { AddPlaylistModal } from "@/app/playlists/components/add-playlist-modal"
import FloatingActionButton from "@/components/ui/floating-plus"
import { fetchVisiblePlaylists } from "@/app/playlists/supabase"
import { AuthWrapper } from "@/components/auth-wrapper"
import { useAuth } from "@/lib/auth-context"
import StandardHeader from "@/components/standard-header"
import { useQuery } from "@tanstack/react-query"
import { CardGrid } from "@/components/card-grid"
import { Card, CardHeader, CardBody } from "@/components/card"

function PlaylistsPageContent() {
  const { player } = useAuth()
  const [open, setOpen] = useState(false)

  const { data: playlists, isLoading } = useQuery({
    queryKey: ["playlists", player?.auth_user_id],
    queryFn: () => fetchVisiblePlaylists(player!.auth_user_id),
    enabled: !!player,
  })

  if (!player || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    )
  }

  return (
    <div>
      <StandardHeader text="Playlists" />
      {!playlists || playlists.length === 0 ? (
        <p>No playlists added yet.</p>
      ) : (
        <CardGrid>
          {playlists.map((item) => (
            <Card key={item.playlist_id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{item.title}</h3>
                  {!item.is_public && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-green-900/50 text-green-400">Private</span>
                  )}
                </div>
                <p className="text-neutral-400 text-sm mt-1">
                  Created by {item.created_by_name} on {new Intl.DateTimeFormat("en-GB", {
                    day: "2-digit", month: "2-digit", year: "numeric",
                  }).format(new Date(item.created_at))}
                </p>
              </CardHeader>
              <CardBody>
                <p className="text-neutral-400 text-sm mb-3">{item.description}</p>
                <NextLink href={`/playlists/${item.playlist_id}`} className="px-3 py-1.5 rounded bg-neutral-700 hover:bg-neutral-600 text-sm transition-colors">
                  View Playlist
                </NextLink>
              </CardBody>
            </Card>
          ))}
        </CardGrid>
      )}
      <FloatingActionButton onClick={() => setOpen(true)} iconType="add" />
      <AddPlaylistModal isOpen={open} onClose={() => setOpen(false)} />
    </div>
  )
}

export default function PlaylistsPage() {
  return (
    <AuthWrapper>
      <PlaylistsPageContent />
    </AuthWrapper>
  )
}
