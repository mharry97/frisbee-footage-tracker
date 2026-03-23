"use client"

import type React from "react"
import { useRequireAuth } from "@/lib/auth-context"

interface AuthWrapperProps {
  children: React.ReactNode
  requireAdmin?: boolean
  fallback?: React.ReactNode
}

export function AuthWrapper({ children, requireAdmin = false, fallback }: AuthWrapperProps) {
  const { player, loading } = useRequireAuth()

  if (loading) {
    return fallback || (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Authenticating...</p>
      </div>
    )
  }

  if (!player) return null

  if (requireAdmin && !player.is_admin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-400 text-lg">Access denied. Admin privileges required.</p>
      </div>
    )
  }

  return <>{children}</>
}
