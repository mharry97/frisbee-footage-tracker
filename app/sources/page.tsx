"use client";

import {Box, Button, Card, Container, SimpleGrid, Text} from "@chakra-ui/react";
import { fetchSources } from "@/app/sources/supabase";
import {AuthWrapper} from "@/components/auth-wrapper";
import NextLink from "next/link";
import SourceForm from "@/app/sources/components/source-form.tsx";
import {useAuth} from "@/lib/auth-context.tsx";
import StandardHeader from "@/components/standard-header.tsx";
import {useQuery} from "@tanstack/react-query";

function SourcesPageContent() {
  const { player } = useAuth()

  const { data: sources, isLoading } = useQuery({
    queryFn: () => fetchSources(),
    queryKey: ["sources"]
  })

  if (!player || isLoading) {
    return (
      <Box minH="100vh" p={4} display="flex" alignItems="center" justifyContent="center">
        <Text color="white" fontSize="lg">Loading player data...</Text>
      </Box>
    )
  }
  if (!sources) {
    return (
      <Container maxW="4xl">
        <StandardHeader text="Teams" is_admin={player.is_admin} />
        <Text color="white" fontSize="lg">No sources yet!</Text>
      </Container>
    )
  }

  return (
    <Container maxW="4xl">
      <StandardHeader text="Sources" is_admin={player.is_admin} />
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={8} mb={8}>
        {sources.map((item) => (
          <Card.Root key={item.source_id} variant="elevated">
            <Card.Header>
              <Card.Title>{item.title}</Card.Title>
              <Card.Description>{item.recorded_date}</Card.Description>
            </Card.Header>
            <Card.Body>
              <Card.Description>
                {item.url}
              </Card.Description>
            </Card.Body>
            <Card.Footer gap="2">
              <SourceForm mode="edit" currentSourceData={item} />
              <NextLink href={item.url} passHref>
                <Button variant="ghost">
                  View
                </Button>
              </NextLink>
            </Card.Footer>
          </Card.Root>
        ))}
      </SimpleGrid>
      <SourceForm mode="add" />
    </Container>
  );
}

export default function SourcesPage() {
  return (
    <AuthWrapper>
      <SourcesPageContent />
    </AuthWrapper>
  )
}
