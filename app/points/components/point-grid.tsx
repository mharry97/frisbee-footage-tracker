"use client";

import React from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  CloseButton,
  Dialog,
  Portal,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import OnPageVideoLink from "@/components/on-page-video-link";
import { baseUrlToTimestampUrl } from "@/lib/utils";
import {PointDetailed} from "@/app/points/supabase.ts";
import NextLink from "next/link";


interface PointGridProps {
  points: PointDetailed[];
}

export function PointGrid({ points }: PointGridProps) {
  if (!points || points.length === 0) {
    return (
      <Box p={4} display="flex" alignItems="center" justifyContent="center">
        <Text color="white" fontSize="lg">
          No points found.
        </Text>
      </Box>
    );
  }

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} gap={8} mb={8}>
      {points.map((item) => (
        <Card.Root key={item.point_id} variant="elevated">
          <Card.Header>
            <Card.Title>{item.event_name}</Card.Title>
            <Card.Description>{item.timestamp}</Card.Description>
            <Text>
              Offence Team: {item.offence_team_name}
            </Text>
          </Card.Header>
          <Card.Body>
            <Card.Description>
              {item.point_outcome === "break" ? (
                <Badge colorPalette="red">Break</Badge>
              ) : (
                <Badge colorPalette="green">Hold</Badge>
              )}
            </Card.Description>
          </Card.Body>
          <Card.Footer gap="2">
            <NextLink href={`/events/${item.event_id}/${item.point_id}/view`} passHref>
              <Button colorPalette="gray" variant="solid">
                Details
              </Button>
            </NextLink>
            <Dialog.Root size="xl">
              <Dialog.Trigger asChild>
                <Button colorPalette="gray" variant="ghost">Quick View</Button>
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
  );
}
