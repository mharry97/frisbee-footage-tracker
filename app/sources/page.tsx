"use client"

import { fetchSources } from "@/app/sources/supabase"
import { AuthWrapper } from "@/components/auth-wrapper"
import NextLink from "next/link"
import SourceForm from "@/app/sources/components/source-form"
import { CardGrid } from "@/components/card-grid"
import { Card, CardHeader, CardBody, CardFooter } from "@/components/card"
import { useAuth } from "@/lib/auth-context"
import StandardHeader from "@/components/standard-header"
import { useQuery } from "@tanstack/react-query"

function SourcesPageContent() {
  const { player } = useAuth()

  const { data: sources, isLoading } = useQuery({
    queryFn: () => fetchSources(),
    queryKey: ["sources"],
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
      <StandardHeader text="Sources" />
      {!sources || sources.length === 0 ? (
        <p>No sources yet!</p>
      ) : (
        <CardGrid>
          {sources.map((item) => (
            <Card key={item.source_id}>
              <CardHeader>
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-neutral-400 text-sm">{item.recorded_date}</p>
              </CardHeader>
              <CardBody>
                <p className="text-neutral-400 text-sm truncate">{item.url}</p>
              </CardBody>
              <CardFooter>
                <div className="flex gap-2">
                  <NextLink href={item.url} target="_blank" className="px-3 py-1.5 rounded bg-neutral-700 hover:bg-neutral-600 text-sm transition-colors">
                    View
                  </NextLink>
                  <SourceForm mode="edit" currentSourceData={item} />
                </div>
              </CardFooter>
            </Card>
          ))}
        </CardGrid>
      )}
      <SourceForm mode="add" />
    </div>
  )
}

export default function SourcesPage() {
  return (
    <AuthWrapper>
      <SourcesPageContent />
    </AuthWrapper>
  )
}
