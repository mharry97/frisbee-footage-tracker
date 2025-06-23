"use client"

import {
  Container,
  Box,
  Text,
  SimpleGrid,
  Card, HStack, Button,
} from "@chakra-ui/react";
import { fetchEvents } from "@/app/events/supabase";
import {AuthWrapper} from "@/components/auth-wrapper";
import {useAuth} from "@/lib/auth-context.tsx";
import StandardHeader from "@/components/standard-header.tsx";
import {useQuery} from "@tanstack/react-query";
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
      <Box minH="100vh" p={4} display="flex" alignItems="center" justifyContent="center">
        <Text color="white" fontSize="lg">Loading event data...</Text>
      </Box>
    );
  }
  if (!events) {
    return (
      <Container maxW="4xl">
        <StandardHeader text="Events" is_admin={player.is_admin} />
        <Text color="white" fontSize="lg">No events yet!</Text>
      </Container>
    )
  }

  return (
    <Container maxW="4xl">
      <StandardHeader text="Events" is_admin={player.is_admin} />
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={8} mb={8}>
        {events.map((item) => (
            <Card.Root
              key={item.event_id}
              variant={item.team_1_scores + item.team_2_scores > 0 ? "outline" : "elevated"}
              borderColor={item.team_1_scores + item.team_2_scores > 0 ? "gray.400" : "transparent"}
              borderWidth={item.team_1_scores + item.team_2_scores > 0 ? "1px" : "0px"}
            >
              <Card.Header>
                <Card.Title>{item.event_name}</Card.Title>
                <Card.Description>{item.event_date}</Card.Description>
              </Card.Header>
              <Card.Body>
                {item.type !== "Game" ? (<Text></Text>)
                : item.team_1_scores + item.team_1_scores === 0 ? (
                    <HStack>
                      <Text>{item.team_1}</Text>
                      <Text> Vs. </Text>
                      <Text> {item.team_2}</Text>
                    </HStack>
                  ) : (
                    <HStack>
                      <Text>{item.team_1}</Text>
                      <Text> {item.team_1_scores}</Text>
                      <Text> : </Text>
                      <Text>{item.team_2_scores}</Text>
                      <Text> {item.team_2}</Text>
                    </HStack>
                  )}
              </Card.Body>
              <Card.Footer gap="2">
                <Button asChild variant="solid">
                  <a href={`/events/${item.event_id}`}>
                    View
                  </a>
                </Button>
                <EventForm mode="edit" currentData={item} />
              </Card.Footer>
            </Card.Root>
        ))}
      </SimpleGrid>
      <EventForm mode="add" />
    </Container>
  )
}

export default function EventsPage() {
  return (
    <AuthWrapper>
      <EventsPageContent />
    </AuthWrapper>
  )
}
