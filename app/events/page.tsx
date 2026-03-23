"use client"

import { fetchEvents } from "@/app/events/supabase";
import { AuthWrapper } from "@/components/auth-wrapper";
import { useAuth } from "@/lib/auth-context.tsx";
import StandardHeader from "@/components/standard-header.tsx";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import EventForm from "@/app/events/components/event-form.tsx";
import { CardGrid } from "@/components/card-grid";
import { Card, CardHeader, CardBody } from "@/components/card";

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
      <CardGrid>
        {events.map((item) => (
          <Card
            key={item.event_id}
            className={item.team_1_scores + item.team_2_scores > 0 ? "border-neutral-500" : ""}
          >
            <CardHeader>
              <h3 className="font-medium">{item.event_name}</h3>
              <p className="text-neutral-400 text-sm">{item.event_date}</p>
            </CardHeader>
            <CardBody>
              {item.type === "Game" && (
                <p className="text-sm mb-3">
                  {item.team_1_scores + item.team_2_scores === 0
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
            </CardBody>
          </Card>
        ))}
      </CardGrid>
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
