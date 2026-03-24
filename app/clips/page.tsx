"use client"

import { useAuth } from "@/lib/auth-context"
import StandardHeader from "@/components/standard-header"

export default function ClipsPage() {
  const { player } = useAuth()

  if (!player) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">Loading...</p>
    </div>
  )

  return (
    <div>
      <StandardHeader text="Clips" />
      <p>Still working this bit out</p>
    </div>
  )
}
