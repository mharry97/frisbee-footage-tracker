"use client"

import { AuthWrapper } from "@/components/auth-wrapper"
import { useAuth } from "@/lib/auth-context"
import { useQuery } from "@tanstack/react-query"
import { fetchTeams } from "@/app/teams/supabase"
import StandardHeader from "@/components/standard-header"
import TeamModal from "@/app/teams/components/team-modal"
import NextLink from "next/link"

function TeamsPageContent() {
  const { player } = useAuth()

  const { data: teams, isLoading } = useQuery({
    queryFn: () => fetchTeams(),
    queryKey: ["teams"],
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
      <StandardHeader text="Teams" />
      {!teams || teams.length === 0 ? (
        <p>No teams yet!</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {teams.map((item, index) => (
            <div key={index} className="bg-neutral-900 rounded-lg border border-neutral-700 overflow-hidden">
              <div className="p-4 border-b border-neutral-700">
                <h3 className="font-medium">{item.team_name}</h3>
              </div>
              <div className="p-4">
                <NextLink href={`/teams/${item.team_id}`} className="px-3 py-1.5 rounded bg-neutral-700 hover:bg-neutral-600 text-sm transition-colors">
                  View Team
                </NextLink>
              </div>
            </div>
          ))}
        </div>
      )}
      <TeamModal />
    </div>
  )
}

export default function TeamsPage() {
  return (
    <AuthWrapper>
      <TeamsPageContent />
    </AuthWrapper>
  )
}
