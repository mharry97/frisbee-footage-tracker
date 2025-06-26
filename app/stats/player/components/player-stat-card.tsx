"use client";

import {Avatar, Box, HStack, Text, VStack} from "@chakra-ui/react";
import type { PlayerStatLine } from "@/app/stats/player/player-base-stats";
import NextLink from "next/link";
import React from "react";

interface StatLeaderCardProps {
  label: string;
  player?: PlayerStatLine;
  statValue?: number;
}

export function StatLeaderCard({ label, player, statValue }: StatLeaderCardProps) {
  if (!player) {
    // If no player, render a placeholder card. It is not a link.
    return (
      <Box border="1px solid #202020" borderRadius="lg" p={4} opacity={0.5}>
        <VStack gap="2">
          <Text>{label}</Text>
          <Text fontSize="2xl" fontWeight="bold" color="gray.500">-</Text>
          <Text fontSize="md" color="gray.500" fontStyle="italic">No Data</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <VStack>
      <Text>{label}</Text>
      <NextLink href={`/players/${player.player_id}`}>

        <Box borderRadius="lg" p={4} _hover={{ bg: "#101010" }}>
            <HStack gap="4">
              <Avatar.Root colorPalette = 'gray'>
                <Avatar.Fallback />
              </Avatar.Root>
              <Text>{player.player_name}</Text>
              <Text textStyle="2xl" color="yellow.400">{statValue}</Text>
            </HStack>
        </Box>
      </NextLink>
    </VStack>
  );
}
