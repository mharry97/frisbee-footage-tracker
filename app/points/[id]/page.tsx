"use client";

import React, { useEffect, useState } from "react";
import { Container } from "@chakra-ui/react";
import Header from "@/components/header";
import { Event } from "@/lib/supabase"
import { fetchEvent } from "@/app/events/supabase";

export default function NewPointPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap the promised params
  const { id } = React.use(params);
  const [eventData, setEventData] = useState<Event | null>(null);

  // Fetch Source
  useEffect(() => {
    if (!id) return;
    async function loadSource() {
      const eventData = await fetchEvent(id);
      if (eventData) {
        setEventData(eventData);
      }
    }
    loadSource();
  }, [id]);

  return (
    <Container maxW="4xl">
      <Header
        title={eventData ? eventData.event_name : ""}
        buttonText={eventData ? eventData.event_name : ""}
        redirectUrl={`/events/${eventData ? eventData.event_id : ""}`}
      />
    </Container>
  );
}
