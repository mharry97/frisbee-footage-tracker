"use client"

import React, { useState } from "react";
import NextLink from "next/link";
import { AuthWrapper } from "@/components/auth-wrapper";
import { useAuth } from "@/lib/auth-context.tsx";
import StandardHeader from "@/components/standard-header.tsx";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchFilteredPossessions } from "@/app/possessions/supabase.ts";
import OnPageVideoLink from "@/components/on-page-video-link.tsx";
import { baseUrlToTimestampUrl } from "@/lib/utils.ts";
import { PossessionFilters } from "@/app/possessions/components/PossessionFilters.tsx";
import { CustomModal } from "@/components/modal";
import { CardGrid } from "@/components/card-grid";
import { Card, CardHeader, CardBody } from "@/components/card";

function EventsPageContent() {
  const { player } = useAuth();
  const [activeFilters, setActiveFilters] = useState({});
  const [quickViewUrl, setQuickViewUrl] = useState<string | null>(null);

  const { data: possessions, isLoading } = useQuery({
    queryKey: ["possessions", activeFilters],
    queryFn: () => fetchFilteredPossessions(activeFilters),
    enabled: !!player,
    placeholderData: keepPreviousData
  });

  if (!player || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading player data...</p>
      </div>
    )
  }

  return (
    <div>
      <StandardHeader text="Possession Search" />
      <PossessionFilters
        onApplyFilters={setActiveFilters}
        onClearFilters={() => setActiveFilters({})}
      />
      {possessions ? (
        <CardGrid className="mt-8">
          {possessions.map((item) => (
            <Card key={item.possession_id}>
              <CardHeader>
                <h3 className="font-medium">{item.event_name}</h3>
                <p className="text-neutral-400 text-sm">Possession {item.possession_number}</p>
              </CardHeader>
              <CardBody>
                <div className="mb-2">
                  <p className="font-medium text-sm">Offence: {item.offence_team_name}</p>
                  <p className="text-neutral-400 text-xs">{item.offence_init_name || "None"} &gt; {item.offence_main_name || "None"}</p>
                </div>
                <div className="mb-3">
                  <p className="font-medium text-sm">Defence: {item.defence_team_name}</p>
                  <p className="text-neutral-400 text-xs">{item.defence_init_name || "None"} &gt; {item.defence_main_name || "None"}</p>
                </div>
                <div className="mb-3">
                  {!item.is_score ? (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-red-900/50 text-red-400">Turn</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-green-900/50 text-green-400">Score</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <NextLink
                    href={`/events/${item.event_id}/${item.point_id}/view`}
                    className="px-3 py-1.5 rounded bg-neutral-700 hover:bg-neutral-600 text-sm transition-colors"
                  >
                    View Point
                  </NextLink>
                  <button
                    onClick={() => setQuickViewUrl(baseUrlToTimestampUrl(item.base_url, item.timestamp))}
                    className="px-3 py-1.5 rounded hover:bg-neutral-800 text-sm transition-colors text-neutral-400"
                  >
                    Quick View
                  </button>
                </div>
              </CardBody>
            </Card>
          ))}
        </CardGrid>
      ) : (
        <div className="flex items-center justify-center min-h-[20vh] p-4">
          <p className="text-neutral-400">No possessions found.</p>
        </div>
      )}

      <CustomModal isOpen={!!quickViewUrl} onClose={() => setQuickViewUrl(null)} title="Quick View" fullWidth>
        {quickViewUrl && <OnPageVideoLink url={quickViewUrl} />}
      </CustomModal>
    </div>
  );
}

export default function EventsPage() {
  return (
    <AuthWrapper>
      <EventsPageContent />
    </AuthWrapper>
  )
}
