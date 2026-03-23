"use client"

import { fetchEvents } from "@/app/events/supabase";
import { AuthWrapper } from "@/components/auth-wrapper";
import { useAuth } from "@/lib/auth-context.tsx";
import StandardHeader from "@/components/standard-header.tsx";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import EventForm from "@/app/events/components/event-form.tsx";

function EventsPageContent() {
  const { player } = useAuth()

  const { data: events, isLoading } = useQuery({
    queryFn: () => fetchEvents(),
    queryKey: ["events"]
  })

  if (!player || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading event data...</p>
      </div>
    );
  }

  if (!events) {
    return (
      <div>
        <StandardHeader text="Events" />
        <p>No events yet!</p>
      </div>
    )
  }

  return (
    <div>
      <StandardHeader text="Events" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {events.map((item) => (
          <div
            key={item.event_id}
            className={`bg-neutral-900 rounded-lg overflow-hidden border ${
              item.team_1_scores + item.team_2_scores > 0
                ? "border-neutral-500"
                : "border-neutral-700"
            }`}
          >
            <div className="p-4 border-b border-neutral-700">
              <h3 className="font-medium">{item.event_name}</h3>
              <p className="text-neutral-400 text-sm">{item.event_date}</p>
            </div>
            <div className="p-4">
              {item.type === "Game" && (
                <p className="text-sm mb-3">
                  {item.team_1_scores + item.team_1_scores === 0
                    ? `${item.team_1} vs. ${item.team_2}`
                    : `${item.team_1} ${item.team_1_scores} : ${item.team_2_scores} ${item.team_2}`
                  }
                </p>
              )}
              <div className="flex gap-2">
                <a
                  href={`/events/${item.event_id}`}
                  className="px-3 py-1.5 rounded bg-neutral-700 hover:bg-neutral-600 text-sm transition-colors"
                >
                  View
                </a>
                <EventForm mode="edit" currentData={item} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <EventForm mode="add" />
    </div>
  )
}

export default function EventsPage() {
  return (
    <AuthWrapper>
      <EventsPageContent />
    </AuthWrapper>
  )
}
