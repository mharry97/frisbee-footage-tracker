"use client";

import {
  AspectRatio,
  Button,
  Card,
  Center,
  CloseButton, Container,
  Dialog,
  Portal,
  SimpleGrid,
} from "@chakra-ui/react";
import { Clip } from "@/lib/supabase";
import { getFootageProvider } from "@/lib/utils";
import {WatchButton} from "@/components/watch-button";
type ClipCardProps = { clip: Clip };

function ClipCard({ clip }: ClipCardProps) {

  const sourceHost = getFootageProvider(clip.timestamp_url)
  return (
    <Card.Root width="320px">
      <Card.Body gap="2">
        <Card.Title mt="2">{clip.title}</Card.Title>
        <Card.Description>{clip.description}</Card.Description>
      </Card.Body>

      <Card.Footer justifyContent="flex-end">
        {sourceHost != "youtube" && sourceHost != "google_drive" ? (
            <WatchButton url={clip.timestamp_url} />
        ) : (
          <Dialog.Root size="md">
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
                    <AspectRatio ratio={16 / 9} w="full">
                      <iframe
                        src={clip.timestamp_url}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={`Clip ${clip.title}`}
                        style={{ border: 0 }}
                      />
                    </AspectRatio>
                  </Dialog.Body>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton size="sm" />
                  </Dialog.CloseTrigger>
                </Dialog.Content>
              </Dialog.Positioner>
            </Portal>
          </Dialog.Root>
        )}
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
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} mt={4}>
        {clips.map((clip) => (
          <Center key={clip.clip_id}>
            <ClipCard clip={clip} />
          </Center>
        ))}
      </SimpleGrid>
    </Container>
  );
}
