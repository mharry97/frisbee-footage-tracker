"use client"

import { useState, useEffect } from "react"
import { Container, Heading, Button, Table, Badge, VStack, HStack, Text } from "@chakra-ui/react"
import { supabase } from "@/lib/supabase"
import type { Player, Team } from "@/lib/supabase"
import { AuthWrapper } from "@/components/auth-wrapper"

function PlayersPageContent() {
  const [players, setPlayers] = useState<Player[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [playersResponse, teamsResponse] = await Promise.all([
        supabase.from("players").select("*").order("player_name"),
        supabase.from("teams").select("*").order("team_name"),
      ])

      setPlayers(playersResponse.data || [])
      setTeams(teamsResponse.data || [])
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleUserStatus = async (playerId: string, isActive: boolean) => {
    try {
      const { error } = await supabase.from("players").update({ is_active: !isActive }).eq("player_id", playerId)

      if (error) throw error
      await loadData()
    } catch (error) {
      console.error("Error updating user status:", error)
    }
  }

  if (loading) {
    return (
      <Container maxW="4xl" py={8}>
        <Text color="white">Loading...</Text>
      </Container>
    )
  }

  return (
    <Container maxW="6xl" py={8}>
      <VStack gap={6} align="stretch">
        <HStack justify="space-between">
          <Heading color="white">User Management</Heading>
          <Button colorScheme="green">Add User</Button>
        </HStack>

        <Table.Root size="lg" interactive colorPalette="gray">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Name</Table.ColumnHeader>
              <Table.ColumnHeader>Username</Table.ColumnHeader>
              <Table.ColumnHeader>Team</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="center" width="15%">
                Role
              </Table.ColumnHeader>
              <Table.ColumnHeader textAlign="center" width="15%">
                Status
              </Table.ColumnHeader>
              <Table.ColumnHeader textAlign="right" width="25%">
                Actions
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {players.map((player) => {
              const team = teams.find((t) => t.team_id === player.team_id)
              return (
                <Table.Row key={player.player_id}>
                  <Table.Cell>{player.player_name}</Table.Cell>
                  <Table.Cell>{player.username}</Table.Cell>
                  <Table.Cell>{team?.team_name || "Unknown"}</Table.Cell>
                  <Table.Cell textAlign="center">
                    <Badge colorPalette={player.is_admin ? "red" : "blue"}>{player.is_admin ? "Admin" : "User"}</Badge>
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    <Badge colorPalette={player.is_active ? "green" : "red"}>
                      {player.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell textAlign="right">
                    <HStack gap={2} justify="flex-end">
                      <Button
                        size="sm"
                        colorPalette={player.is_active ? "red" : "green"}
                        variant="outline"
                        onClick={() => toggleUserStatus(player.player_id, player.is_active)}
                      >
                        {player.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button size="sm" variant="outline">
                        Reset Password
                      </Button>
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table.Root>
      </VStack>
    </Container>
  )
}

export default function PlayersPage() {
  return (
    <AuthWrapper requireAdmin={true}>
      <PlayersPageContent />
    </AuthWrapper>
  )
}
