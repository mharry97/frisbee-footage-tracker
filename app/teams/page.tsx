"use client"

import { AuthWrapper } from "@/components/auth-wrapper"
import { useAuth } from "@/lib/auth-context"
import { useQuery } from "@tanstack/react-query"
import { fetchTeams } from "@/app/teams/supabase"
import StandardHeader from "@/components/standard-header"
import TeamModal from "@/app/teams/components/team-modal"
import NextLink from "next/link"
import { Card, CardHeader, CardBody } from "@/components/card"
import { CardGrid } from "@/components/card-grid"

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
        <CardGrid>
          {teams.map((item, index) => (
            <Card key={index}>
              <CardHeader>
                <h3 className="font-medium">{item.team_name}</h3>
              </CardHeader>
              <CardBody>
                <NextLink href={`/teams/${item.team_id}`} className="px-3 py-1.5 rounded bg-neutral-700 hover:bg-neutral-600 text-sm transition-colors">
                  View Team
                </NextLink>
              </CardBody>
            </Card>
          ))}
        </CardGrid>
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
