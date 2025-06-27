"use client";

import React from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  CloseButton,
  Dialog, HStack,
  Portal,
  SimpleGrid,
  Text, useDisclosure,
} from "@chakra-ui/react";
import OnPageVideoLink from "@/components/on-page-video-link";
import { baseUrlToTimestampUrl } from "@/lib/utils";
import type { ClipDetail } from "@/app/clips/supabase";
import {AddClipModal} from "@/app/clips/components/add-clip-modal.tsx";


interface ClipGridProps {
  clips: ClipDetail[];
  playerId: string;
}

export function ClipGrid({ clips, playerId } : ClipGridProps) {
  const { open, onOpen, onClose } = useDisclosure();
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
    <>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={8} mb={8}>
        {clips.map((item) => (
          <Card.Root key={item.clip_id} variant="elevated">
            <Card.Header>
              <HStack justify='space-between'>
                <Card.Title>{item.title}</Card.Title>
                <Card.Title>
                  {!item.is_public && (<Badge colorPalette="green">Private</Badge>)}
                </Card.Title>
              </HStack>
            </Card.Header>
            <Card.Body>
              <Card.Description>{item.description}</Card.Description>
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
                          <OnPageVideoLink url={baseUrlToTimestampUrl(item.url, item.timestamp)} />
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
                <AddClipModal
                  playerId={playerId}
                  isOpen={open}
                  onClose={onClose}
                  mode="edit"
                  key={item.clip_id}
                  clipToEdit={item}
                />
              </HStack>
            </Card.Footer>
          </Card.Root>
        ))}
      </SimpleGrid>
    </>
  );
}
