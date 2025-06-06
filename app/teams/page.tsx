"use client"

import {Box, Card, Container, SimpleGrid, Text} from "@chakra-ui/react";
import {AuthWrapper} from "@/components/auth-wrapper.tsx";
import {useAuth} from "@/lib/auth-context.tsx";
import {useQuery} from "@tanstack/react-query";
import {fetchTeams} from "@/app/teams/supabase.ts";
import React from "react";
import StandardHeader from "@/components/standard-header.tsx";
import TeamModal from "@/app/teams/components/team-modal.tsx";

function TeamsPageContent() {
  const { player } = useAuth()

  const { data: teams, isLoading } = useQuery({
    queryFn: () => fetchTeams(),
    queryKey: ["teams"]
  })


  if (!player || isLoading) {
    return (
      <Box minH="100vh" p={4} display="flex" alignItems="center" justifyContent="center">
        <Text color="white" fontSize="lg">Loading team data...</Text>
      </Box>
    );
  }
  if (!teams) {
    return (
      <Container maxW="4xl">
        <StandardHeader text="Teams" is_admin={player.is_admin} />
        <Text color="white" fontSize="lg">No teams yet!</Text>
      </Container>
    )
  }

  return (
    <Container maxW="4xl">
      <StandardHeader text="Teams" is_admin={player.is_admin} />
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={8} mb={8}>
        {teams.map((item, index) => (
          <Card.Root key={index} variant="elevated">
            <Card.Header>
              <Card.Title>{item.team_name}</Card.Title>
              <Card.Description>Description</Card.Description>
            </Card.Header>
            <Card.Body>
              <Card.Description>
              </Card.Description>
            </Card.Body>
            <Card.Footer gap="2">
              Hello
            </Card.Footer>
          </Card.Root>
        ))}
      </SimpleGrid>
      <TeamModal />
    </Container>
  )
}

export default function TeamsPage() {
  return (
    <AuthWrapper>
      <TeamsPageContent />
    </AuthWrapper>
  )
}
