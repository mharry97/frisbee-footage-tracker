"use client"

import type React from "react"
import { Box, Text } from "@chakra-ui/react"
import { useRequireAuth } from "@/lib/auth-context"

interface AuthWrapperProps {
  children: React.ReactNode
  requireAdmin?: boolean
  fallback?: React.ReactNode
}

export function AuthWrapper({ children, requireAdmin = false, fallback }: AuthWrapperProps) {
  const { player, loading } = useRequireAuth()

  if (loading) {
    return (
      fallback || (
        <Box minH="100vh" bg="black" p={4} display="flex" alignItems="center" justifyContent="center">
          <Text color="white" fontSize="xl">
            Loading...
          </Text>
        </Box>
      )
    )
  }

  if (!player) {
    return null
  }

  if (requireAdmin && !player.is_admin) {
    return (
      <Box minH="100vh" bg="black" p={4} display="flex" alignItems="center" justifyContent="center">
        <Text color="red.500" fontSize="xl">
          Access denied. Admin privileges required.
        </Text>
      </Box>
    )
  }

  return <>{children}</>
}
