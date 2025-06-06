"use client";

import React, {useCallback, useEffect, useState} from "react";
import {Box, Button, Card, CloseButton, Container, Dialog, Heading, Portal, SimpleGrid, Text} from "@chakra-ui/react";
import type { Source } from "./supabase.ts";
import { fetchSources } from "@/app/sources/supabase";
import {AuthWrapper} from "@/components/auth-wrapper";
import NextLink from "next/link";
import SourceForm from "@/app/sources/components/source-form.tsx";
import FloatingPlusButton from "@/components/ui/floating-plus.tsx";
import {useAuth} from "@/lib/auth-context.tsx";

function SourcesPageContent() {
  const { player } = useAuth()
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshSources = useCallback(async () => {
    if (!player) return
    setLoading(true)
    try {
      const data = await fetchSources();
      setSources(data);
    } catch (err) {
      console.error("Error refreshing sources:", err)
    } finally {
      setLoading(false)
    }
  }, [player])

  useEffect(() => {
    (async () => {
      await refreshSources()
    })()
  }, [refreshSources])

  if (!player || loading) {
    return (
      <Box minH="100vh" p={4} display="flex" alignItems="center" justifyContent="center">
        <Text color="white" fontSize="lg">Loading player data...</Text>
      </Box>
    )
  }

  return (
    <Container maxW="4xl">
      <Heading as="h1" fontWeight="light" size='4xl' color="white" mb={4} mt={4}>
        Sources
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={8} mb={8}>
        {sources.map((item, index) => (
          <Card.Root key={index} variant="elevated">
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
              <Dialog.Root>
                <Dialog.Trigger asChild>
                  <Button variant="solid">Edit</Button>
                </Dialog.Trigger>
                <Portal>
                  <Dialog.Backdrop />
                  <Dialog.Positioner>
                    <Dialog.Content>
                      <Dialog.Header>Edit Source</Dialog.Header>
                      <Dialog.Body>
                        <SourceForm
                          mode="edit"
                          currentSourceData={item}
                          onSuccess={refreshSources}
                        />
                      </Dialog.Body>
                      <Dialog.CloseTrigger asChild>
                        <CloseButton size="sm" />
                      </Dialog.CloseTrigger>
                    </Dialog.Content>
                  </Dialog.Positioner>
                </Portal>
              </Dialog.Root>
              <NextLink href={item.url} passHref>
                <Button variant="ghost">
                  View
                </Button>
              </NextLink>
            </Card.Footer>
          </Card.Root>
        ))}
      </SimpleGrid>
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <FloatingPlusButton />
        </Dialog.Trigger>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>Edit Source</Dialog.Header>
              <Dialog.Body>
                <SourceForm mode="add" onSuccess={refreshSources} />
              </Dialog.Body>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
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
