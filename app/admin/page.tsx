"use client"

import React, { useState, useEffect, useCallback } from "react"
import { AuthWrapper } from "@/components/auth-wrapper"
import { getHomeTeamPlayerInfo } from "@/app/admin/supabase"
import { useAuth } from "@/lib/auth-context"
import FloatingActionButton from "@/components/ui/floating-plus"
import NewUserDetailsPortal from "@/app/admin/component/new-user-details"
import EditUserDetailsPortal from "@/app/admin/component/edit-user-details"
import StandardHeader from "@/components/standard-header"
import { PlayerDetailed } from "@/app/players/supabase"
import { CustomModal } from "@/components/modal"
import { CardGrid } from "@/components/card-grid"
import { Card, CardHeader, CardBody } from "@/components/card"

function PlayersPageContent() {
  const { player } = useAuth()
  const [players, setPlayers] = useState<PlayerDetailed[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPlayer, setEditingPlayer] = useState<PlayerDetailed | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  const refreshPlayers = useCallback(async () => {
    if (!player) return
    setLoading(true)
    try {
      const result = await getHomeTeamPlayerInfo(player.team_id)
      setPlayers(result)
    } catch (err) {
      console.error("Error refreshing players:", err)
    } finally {
      setLoading(false)
    }
  }, [player])

  useEffect(() => {
    refreshPlayers()
  }, [refreshPlayers])

  if (!player || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    )
  }

  return (
    <div>
      <StandardHeader text="Admin" />
      <CardGrid>
        {players.map((item, index) => (
          <Card key={index}>
            <CardHeader>
              <h3 className="font-medium">{item.player_name}</h3>
              <p className="text-neutral-400 text-sm">{item.username || "No account"}</p>
            </CardHeader>
            <CardBody>
              <div className="flex gap-2 mb-3">
                <span className={`px-2 py-0.5 rounded-full text-xs ${item.is_active ? "bg-green-900/50 text-green-400" : "bg-red-900/50 text-red-400"}`}>
                  {item.is_active ? "Active" : "Inactive"}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${item.is_editor ? "bg-green-900/50 text-green-400" : "bg-red-900/50 text-red-400"}`}>
                  {item.is_editor ? "Editor" : "Non-Editor"}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${item.is_admin ? "bg-green-900/50 text-green-400" : "bg-red-900/50 text-red-400"}`}>
                  {item.is_admin ? "Admin" : "Non-Admin"}
                </span>
              </div>
              <button
                onClick={() => setEditingPlayer(item)}
                className="px-3 py-1.5 rounded bg-neutral-700 hover:bg-neutral-600 text-sm transition-colors"
              >
                Update User
              </button>
            </CardBody>
          </Card>
        ))}
      </CardGrid>

      <FloatingActionButton iconType="add" onClick={() => setAddOpen(true)} />

      <CustomModal isOpen={!!editingPlayer} onClose={() => setEditingPlayer(null)} title="Edit User">
        {editingPlayer && (
          <EditUserDetailsPortal
            onSuccess={() => { refreshPlayers(); setEditingPlayer(null) }}
            defaultValues={{
              player_name: editingPlayer.player_name,
              email: editingPlayer.username ?? "",
              is_active: editingPlayer.is_active,
              is_admin: editingPlayer.is_admin,
              is_editor: editingPlayer.is_editor,
            }}
            playerId={editingPlayer.player_id}
            auth_user_id={editingPlayer.auth_user_id}
          />
        )}
      </CustomModal>

      <CustomModal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add User">
        <NewUserDetailsPortal onSuccess={() => { refreshPlayers(); setAddOpen(false) }} />
      </CustomModal>
    </div>
  )
}

export default function PlayersPage() {
  return (
    <AuthWrapper requireAdmin={true}>
      <PlayersPageContent />
    </AuthWrapper>
  )
}
