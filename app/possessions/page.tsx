"use client"

import React, {useState} from "react";
import {
  Badge,
  Box,
  Button,
  Card, CloseButton,
  Container,
  Dialog, Portal,
  SimpleGrid,
  Text
} from "@chakra-ui/react";
import NextLink from "next/link";

import {AuthWrapper} from "@/components/auth-wrapper";
import {useAuth} from "@/lib/auth-context.tsx";
import StandardHeader from "@/components/standard-header.tsx";
import {useQuery, keepPreviousData} from "@tanstack/react-query";
import {fetchFilteredPossessions} from "@/app/possessions/supabase.ts";
import OnPageVideoLink from "@/components/on-page-video-link.tsx";
import {baseUrlToTimestampUrl} from "@/lib/utils.ts";
import {PossessionFilters} from "@/app/possessions/components/PossessionFilters.tsx";


function EventsPageContent() {
  const { player } = useAuth();
  const [activeFilters, setActiveFilters] = useState({});

  // Fetch data
  const { data: possessions, isLoading } = useQuery({
    queryKey: ["possessions", activeFilters],
    queryFn: () => fetchFilteredPossessions(activeFilters),
    enabled: !!player,
    placeholderData: keepPreviousData
  });

  const handleClear = () => {
    setActiveFilters({});
  };

  if (!player || isLoading) {
    return (
      <Box minH="100vh" p={4} display="flex" alignItems="center" justifyContent="center">
        <Text color="white" fontSize="lg">Loading player data...</Text>
      </Box>
    )
  }

  return (
    <Container maxW="4xl">
      <StandardHeader text="Possession Search" is_admin={player.is_admin} />
      <PossessionFilters
        onApplyFilters={setActiveFilters}
        onClearFilters={handleClear}
      />
      { possessions ? (
        <SimpleGrid columns={{base: 1, md: 2}} gap={8} mb={8} mt={8}>
          {possessions.map((item) => (
            <Card.Root key={item.possession_id} variant="elevated">
              <Card.Header>
                <Card.Title>{item.event_name}</Card.Title>
                <Card.Description>
                  Possession {item.possession_number}
                </Card.Description>
              </Card.Header>
              <Card.Body>
                <Card.Title mb={0}>
                  Offence: {item.offence_team_name}
                </Card.Title>
                <Card.Description mb={1}>
                  {item.offence_init_name || "None"} &gt; {item.offence_main_name || "None"}
                </Card.Description>
                <Card.Title mb={0}>
                  Defence: {item.defence_team_name}
                </Card.Title>
                <Card.Description mb={4}>
                  {item.defence_init_name || "None"} &gt; {item.defence_main_name || "None"}
                </Card.Description>
                <Card.Description>
                  {!item.is_score ? (
                    <Badge colorPalette="red">Turn</Badge>
                  ) : (
                    <Badge colorPalette="green">Score</Badge>
                  )}
                </Card.Description>
              </Card.Body>
              <Card.Footer gap="2">
                <NextLink href={`/events/${item.event_id}/${item.point_id}/view`} passHref>
                  <Button colorPalette='gray'>View Point</Button>
                </NextLink>
                <Dialog.Root size="xl">
                  <Dialog.Trigger asChild>
                    <Button variant="ghost">Quick View</Button>
                  </Dialog.Trigger>
                  <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                      <Dialog.Content>
                        <Dialog.Body>
                          <OnPageVideoLink url={baseUrlToTimestampUrl(item.base_url, item.timestamp)} />
                        </Dialog.Body>
                        <Dialog.CloseTrigger asChild>
                          <CloseButton size="sm" />
                        </Dialog.CloseTrigger>
                      </Dialog.Content>
                    </Dialog.Positioner>
                  </Portal>
                </Dialog.Root>
              </Card.Footer>
            </Card.Root>
          ))}
        </SimpleGrid>
      ) : (
        <Box minH="20vh" p={4} display="flex" alignItems="center" justifyContent="center">
          <Text color="white" fontSize="lg">No possessions found.</Text>
        </Box>
        )}
    </Container>
  );
}

export default function EventsPage() {
  return (
    <AuthWrapper>
      <EventsPageContent />
    </AuthWrapper>
  )
}

