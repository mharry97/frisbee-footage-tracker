"use client"

import { useAuth } from "@/lib/auth-context"
import dynamic from "next/dynamic"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { AuthWrapper } from "@/components/auth-wrapper"
import { fetchScrapedPlayers, SearchPlayer } from "@/app/playersearch/supabase"
import StandardHeader from "@/components/standard-header"
import { PlayerModal } from "@/app/players/components/player-modal"
import LoadingSpinner from "@/components/ui/loading-spinner"

const PlayerSearchTable = dynamic(
  () => import("@/app/playersearch/components/player-search-table").then((mod) => mod.PlayerSearchTable),
  { ssr: false, loading: () => <LoadingSpinner text="Loading table..." /> }
)

function PlayerSearchContent() {
  const { player } = useAuth()
  const [open, setOpen] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<SearchPlayer | null>(null)

  const { data: searchPlayerData, isLoading } = useQuery({
    queryFn: () => fetchScrapedPlayers(),
    queryKey: ["searchPlayers"],
  })

  const handleRowClick = (scrapedPlayer: SearchPlayer) => {
    setSelectedPlayer(scrapedPlayer)
    setOpen(true)
  }

  if (!player || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    )
  }

  return (
    <div>
      <StandardHeader text="Search for players" />
      {!searchPlayerData ? (
        <p>No data.</p>
      ) : (
        <PlayerSearchTable data={searchPlayerData} onRowClick={handleRowClick} />
      )}
      {selectedPlayer && (
        <PlayerModal
          key={selectedPlayer.unique_player_id}
          isOpen={open}
          onClose={() => setOpen(false)}
          mode="add"
          playerName={selectedPlayer.event_player_name}
          playerNumber={selectedPlayer.event_player_number}
        />
      )}
    </div>
  )
}

export default function PlayerSearchPage() {
  return (
    <AuthWrapper>
      <PlayerSearchContent />
    </AuthWrapper>
  )
}
