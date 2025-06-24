import {
  Avatar,
  Box,
  HStack,
  SimpleGrid,
  Text
} from "@chakra-ui/react";
import React from "react";
import {PlayerDetailed} from "@/app/players/supabase.ts";
import NextLink from "next/link";

interface ClipGridProps {
  players: PlayerDetailed[];
  metric?: string;
}

export function PlayerGrid({  players }: ClipGridProps) {
  if (!players || players.length === 0) {
    return (
      <Box p={4} display="flex" alignItems="center" justifyContent="center">
        <Text color="white" fontSize="lg">
          No players found.
        </Text>
      </Box>
    );
  }

  return (
    <SimpleGrid columns={{ base: 2, md: 3 }} gap={8} mb={8}>
      {players.map((item) => (
        <NextLink key={item.player_id} href={`/players/${item.player_id}`}>
          <Box border="1px solid #202020" borderRadius="lg" p={4} _hover={{ bg: "#101010" }}>
            <HStack gap="4">
              <Avatar.Root colorPalette = 'gray'>
                {item.number ? (<Avatar.Fallback name={String(item.number)} />):(<Avatar.Fallback />)}
              </Avatar.Root>
              <Text>{item.player_name}</Text>
            </HStack>
          </Box>
        </NextLink>
      ))}
    </SimpleGrid>
  );
}
