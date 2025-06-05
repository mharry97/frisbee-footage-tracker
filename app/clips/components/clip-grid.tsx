"use client";

import {
  Button,
  Card,
  Center,
  CloseButton, Container,
  Dialog,
  Portal,
  SimpleGrid,
} from "@chakra-ui/react";
import { Clip } from "@/lib/supabase";
import OnPageVideoLink from "@/components/on-page-video-link.tsx";
type ClipCardProps = { clip: Clip };

function ClipCard({ clip }: ClipCardProps) {

  return (
    <Card.Root width="4xl">
      <Card.Body gap="2">
        <Card.Title mt="2">{clip.title}</Card.Title>
        <Card.Description>{clip.description}</Card.Description>
      </Card.Body>

      <Card.Footer justifyContent="flex-end">
        <Dialog.Root size="full">
          <Dialog.Trigger asChild>
            <Button variant="solid" size="md" colorPalette="green">
              view
            </Button>
          </Dialog.Trigger>

          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title>{clip.title}</Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>
                  <OnPageVideoLink url={clip.timestamp_url} />
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
  );
}

type ClipGridProps = {
  clips: Clip[];
};

export function ClipGrid({ clips }: ClipGridProps) {
  if (!clips.length) return null;

  return (
    <Container maxW="4xl">
      <SimpleGrid columns={{ base: 1, md: 2 }} columnGap="5" rowGap="5" mt={4}>
        {clips.map((clip) => (
          <Center key={clip.clip_id}>
            <ClipCard clip={clip} />
          </Center>
        ))}
      </SimpleGrid>
    </Container>
  );
}
