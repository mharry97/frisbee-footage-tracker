"use client";

import React from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  CloseButton,
  Dialog,
  HStack,
  Portal,
  SimpleGrid,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import OnPageVideoLink from "@/components/on-page-video-link";
import { baseUrlToTimestampUrl } from "@/lib/utils";
import type { ClipDetail } from "@/app/clips/supabase";
import { AddClipModal } from "@/app/clips/components/add-clip-modal.tsx";

interface ClipCardProps {
  clip: ClipDetail;
  playerId: string;
}

function ClipCard({ clip, playerId }: ClipCardProps) {
  const { open, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Card.Root variant="elevated">
        <Card.Header>
          <HStack justify="space-between">
            <Card.Title>{clip.title}</Card.Title>
            <Card.Title>
              {!clip.is_public && <Badge colorPalette="green">Private</Badge>}
            </Card.Title>
          </HStack>
        </Card.Header>
        <Card.Body>
          <Card.Description>{clip.description}</Card.Description>
        </Card.Body>
        <Card.Footer gap="2">
          <HStack>
            <Dialog.Root size="xl">
              <Dialog.Trigger asChild>
                <Button colorPalette="gray">View Clip</Button>
              </Dialog.Trigger>
              <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                  <Dialog.Content>
                    <Dialog.Body>
                      <OnPageVideoLink
                        url={baseUrlToTimestampUrl(clip.url, clip.timestamp)}
                      />
                    </Dialog.Body>
                    <Dialog.CloseTrigger asChild>
                      <CloseButton size="sm" />
                    </Dialog.CloseTrigger>
                  </Dialog.Content>
                </Dialog.Positioner>
              </Portal>
            </Dialog.Root>
            <Button variant="ghost" colorPalette="gray" onClick={onOpen}>
              Edit
            </Button>
          </HStack>
        </Card.Footer>
      </Card.Root>

      <AddClipModal
        playerId={playerId}
        isOpen={open}
        onClose={onClose}
        mode="edit"
        clipToEdit={clip}
      />
    </>
  );
}

interface ClipGridProps {
  clips: ClipDetail[];
  playerId: string;
}

export function ClipGrid({ clips, playerId }: ClipGridProps) {
  if (!clips || clips.length === 0) {
    return (
      <Box p={4} display="flex" alignItems="center" justifyContent="center">
        <Text color="white" fontSize="lg">
          No clips found.
        </Text>
      </Box>
    );
  }

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} gap={8} mb={8} width="100%">
      {clips.map((item) => (
        <ClipCard key={item.clip_id} clip={item} playerId={playerId} />
      ))}
    </SimpleGrid>
  );
}
