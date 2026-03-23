"use client"

import { AuthWrapper } from "@/components/auth-wrapper"
import { useAuth } from "@/lib/auth-context"
import React, { useEffect, useState } from "react"
import { getPlayerPointsPlayed, PointsByPlayer } from "@/app/teams/[team_id]/[player_id]/supabase"
import { getPlayerStatsFromPossessions, PlayerStats } from "@/app/teams/[team_id]/[player_id]/utils"
import { fetchAllPossessions } from "@/app/possessions/supabase"
import StatTile from "@/components/stat-tile"
import { PointGrid } from "@/app/points/components/point-grid"

function HomepageContent() {
  const { player } = useAuth()
  const [playerPoints, setPlayerPoints] = useState<PointsByPlayer[]>([])
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!player) return
    ;(async () => {
      try {
        const points = await getPlayerPointsPlayed(player.player_id)
        setPlayerPoints(points)
        const allPoints = await fetchAllPossessions()
        const allStats = getPlayerStatsFromPossessions(allPoints)
        setPlayerStats(allStats[String(player.player_id)] ?? null)
      } catch (err) {
        console.error("Error fetching data:", err)
      } finally {
        setLoading(false)
      }
    })()
  }, [player])

  if (!player || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Loading player data...</p>
      </div>
    )
  }

  const turns = (playerStats?.drops ?? 0) + (playerStats?.throwaways ?? 0)

  return (
    <div>
      <h1 className="text-4xl font-light mt-4 mb-6">Hello, {player.player_name}</h1>

      <div className="flex items-center gap-4 mb-6">
        <hr className="flex-1 border-yellow-400/50" />
        <span className="text-xl text-neutral-400">Player Overview</span>
        <hr className="flex-1 border-yellow-400/50" />
      </div>

      <div className="grid grid-cols-3 gap-4 w-full mb-6">
        <StatTile title="+/-" value={playerStats?.plusMinus ?? 0} />
        <StatTile title="Points Played" value={playerPoints.length} />
        <StatTile title="Scores" value={playerStats?.scores ?? 0} />
        <StatTile title="Assists" value={playerStats?.assists ?? 0} />
        <StatTile title="Ds" value={playerStats?.ds ?? 0} />
        <StatTile title="Turns" value={turns} />
      </div>

      <div className="flex items-center gap-4 mb-6">
        <hr className="flex-1 border-neutral-700" />
        <span className="text-neutral-400">Your Points</span>
        <hr className="flex-1 border-neutral-700" />
      </div>

      <PointGrid points={playerPoints} />
    </div>
  )
}

export default function Homepage() {
  return (
    <AuthWrapper>
      <HomepageContent />
    </AuthWrapper>
  )
}
