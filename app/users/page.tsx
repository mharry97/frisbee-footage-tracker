"use client"

import { useState, useEffect } from "react"
import {
  Container,
  Heading,
  Button,
  Table,
  Badge,
  VStack,
  HStack,
  Text,
} from "@chakra-ui/react"
import { supabase } from "@/lib/supabase"
import { useRequireAuth } from "@/lib/auth-context"
import type { Player, Team } from "@/lib/supabase"

export default function UsersPage() {
  const { player: currentPlayer } = useRequireAuth()
  const [players, setPlayers] = useState<Player[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentPlayer?.is_admin) {
      loadData()
    }
  }, [currentPlayer])

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

  if (!currentPlayer?.is_admin) {
    return (
      <Container maxW="4xl" py={8}>
        <Text color="red.500">Access denied. Admin privileges required.</Text>
      </Container>
    )
  }

  if (loading) {
    return (
      <Container maxW="4xl" py={8}>
        <Text>Loading...</Text>
      </Container>
    )
  }

  return (
    <Container maxW="6xl" py={8}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading color="white">User Management</Heading>
          <Button colorScheme="green">Add User</Button>
        </HStack>

        <Table variant="simple" bg="gray.800" borderRadius="md">
          <Thead>
            <Tr>
              <Th color="gray.300">Name</Th>
              <Th color="gray.300">Username</Th>
              <Th color="gray.300">Team</Th>
              <Th color="gray.300">Role</Th>
              <Th color="gray.300">Status</Th>
              <Th color="gray.300">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {players.map((player) => {
              const team = teams.find((t) => t.team_id === player.team_id)
              return (
                <Tr key={player.player_id}>
                  <Td color="white">{player.player_name}</Td>
                  <Td color="white">{player.username}</Td>
                  <Td color="white">{team?.team_name || "Unknown"}</Td>
                  <Td>
                    <Badge colorScheme={player.is_admin ? "yellow" : "blue"}>
                      {player.is_admin ? "Admin" : "User"}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme={player.is_active ? "green" : "red"}>
                      {player.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        colorScheme={player.is_active ? "red" : "green"}
                        variant="outline"
                        onClick={() => toggleUserStatus(player.player_id, player.is_active)}
                      >
                        {player.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button size="sm" variant="outline">
                        Reset Password
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              )
            })}
          </Tbody>
        </Table>
      </VStack>
    </Container>
  )
}
