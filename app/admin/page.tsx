"use client"

import React, {useState, useEffect, useCallback} from "react"
import {
  Container,
  Heading,
  Badge,
  HStack,
  Text,
  Box,
  Card,
  Dialog,
  Portal,
  CloseButton,
  SimpleGrid,
  Button,
} from "@chakra-ui/react"
import { AuthWrapper } from "@/components/auth-wrapper"
import { getHomeTeamPlayerInfo } from "@/app/admin/supabase"
import { TeamPlayer } from "@/app/teams/[team_id]/[player_id]/supabase"
import { useAuth } from "@/lib/auth-context"
import FloatingActionButton from "@/components/ui/plus-button"
import NewUserDetailsPortal from "@/app/admin/component/new-user-details"
import EditUserDetailsPortal from "@/app/admin/component/edit-user-details"

function PlayersPageContent() {
  const { player } = useAuth()
  const [players, setPlayers] = useState<TeamPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPlayer, setEditingPlayer] = useState<TeamPlayer | null>(null)

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
    (async () => {
      await refreshPlayers()
    })()
  }, [refreshPlayers])

  if (!player || loading) {
    return (
      <Box minH="100vh" p={4} display="flex" alignItems="center" justifyContent="center">
        <Text color="white" fontSize="lg">Loading player data...</Text>
      </Box>
    )
  }

  return (
    <Container maxW="4xl">
      <Heading as="h1" fontWeight="light" size="4xl" color="white" mb={4} mt={4}>
        Admin
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap={8} mb={8}>
        {players.map((item, index) => (
          <Card.Root key={index} variant="elevated">
            <Card.Header>
              <Card.Title>{item.player_name}</Card.Title>
              <Card.Description>{item.username || "No account"}</Card.Description>
            </Card.Header>
            <Card.Body>
              <HStack gap={2}>
                <Badge colorPalette={item.is_active ? "green" : "red"}>
                  {item.is_active ? "Active" : "Inactive"}
                </Badge>
                <Badge colorPalette={item.is_editor ? "green" : "red"}>
                  {item.is_editor ? "Editor" : "Non-Editor"}
                </Badge>
                <Badge colorPalette={item.is_admin ? "green" : "red"}>
                  {item.is_admin ? "Admin" : "Non-Admin"}
                </Badge>
              </HStack>
            </Card.Body>
            <Card.Footer gap={2}>
              <Dialog.Root>
                <Dialog.Trigger asChild>
                  <Button
                    variant="solid"
                    onClick={() => setEditingPlayer(item)}
                  >
                    Update User
                  </Button>
                </Dialog.Trigger>
                <Portal>
                  <Dialog.Backdrop />
                  <Dialog.Positioner>
                    <Dialog.Content>
                      <Dialog.Header>Edit User</Dialog.Header>
                      <Dialog.Body>
                        {editingPlayer && (
                          <EditUserDetailsPortal
                            onSuccess={refreshPlayers}
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
                      </Dialog.Body>
                      <Dialog.CloseTrigger asChild>
                        <CloseButton />
                      </Dialog.CloseTrigger>
                    </Dialog.Content>
                  </Dialog.Positioner>
                </Portal>
              </Dialog.Root>
            </Card.Footer>
          </Card.Root>
        ))}
      </SimpleGrid>

      <Dialog.Root>
        <Dialog.Trigger asChild>
          <FloatingActionButton />
        </Dialog.Trigger>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>Add User</Dialog.Header>
              <Dialog.Body>
                <NewUserDetailsPortal onSuccess={refreshPlayers} />
              </Dialog.Body>
              <Dialog.CloseTrigger asChild>
                <CloseButton />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
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
