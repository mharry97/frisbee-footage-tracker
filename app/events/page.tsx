"use client"
import NextLink from "next/link";
import {
  Container,
  Table,
  LinkOverlay,
  LinkBox, Box, Text
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import Header from "@/components/header";
import { fetchEvents, insertEvent } from "@/app/events/supabase";
import { AddEventModal } from "@/app/events/components/add-event-modal";
import { EventCardProps } from "@/app/events/components/event-card";
import LoadingSpinner from "@/components/ui/loading-spinner";
import FloatingActionButton from "@/components/ui/plus-button";
import {AuthWrapper} from "@/components/auth-wrapper";
import {useAuth} from "@/lib/auth-context.tsx";
import StandardHeader from "@/components/standard-header.tsx";

function EventsPageContent() {
  const { player } = useAuth();
  const [events, setEvents] = useState<EventCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    const data = await fetchEvents();
    setEvents(data);
    setLoading(false);
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleAddEvent = async (
    title: string,
    eventDate: string,
    eventType: "Game" | "Training" | "Scrimmage",
    team1: string,
    team2: string
  ) => {
    try {
      await insertEvent(title, eventDate, eventType, team1, team2);
      await loadEvents();
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };

  if (!player || loading) {
    return (
      <Box minH="100vh" p={4} display="flex" alignItems="center" justifyContent="center">
        <Text color="white" fontSize="lg">Loading player data...</Text>
      </Box>
    )
  }

  return (
    <>
      <Container maxW="4xl">
        <StandardHeader text="Events" is_admin={player.is_admin} />
        {loading ? (
          <LoadingSpinner text="Loading events..." />
        ) : (
          <Table.Root
            size="lg"
            interactive
          >
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Event</Table.ColumnHeader>
                <Table.ColumnHeader width="35%" textAlign="right">Date</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {events.map((event) => (
                <Table.Row key={event.event_id}>
                  <Table.Cell>
                    <LinkBox as="div">
                      <LinkOverlay as={NextLink} href={`/events/${event.event_id}`}>
                        {event.event_name}
                      </LinkOverlay>
                    </LinkBox>
                  </Table.Cell>
                  <Table.Cell width="35%" textAlign="right">{event.event_date}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        )}
      </Container>
      <FloatingActionButton aria-label="Add Event" onClick={handleOpenModal} />
      <AddEventModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddEvent={handleAddEvent}
      />
    </>
  );
}

export default function EventsPage() {
  return (
    <AuthWrapper>
      <EventsPageContent />
    </AuthWrapper>
  )
}
