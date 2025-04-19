import React from "react";
import { Box, Badge, Text } from "@chakra-ui/react";
import NextLink from "next/link";

export type EventCardProps = {
  event_id: string;
  event_name: string;
  event_date: string;
  type: "Training" | "Scrimmage" | "Game";
  team_1?: string;
  team_2?: string;
};

export const EventCard: React.FC<EventCardProps> = ({
  event_date,
  type,
  team_1,
  team_2,
  event_name,
  event_id
}) => {
  // Badges
  let badgeColorScheme: string;
  switch (type) {
    case "Training":
      badgeColorScheme = "yellow";
      break;
    case "Scrimmage":
      badgeColorScheme = "blue";
      break;
    case "Game":
      badgeColorScheme = "green";
      break;
    default:
      badgeColorScheme = "gray";
  }

  return (
    <NextLink href={`/events/${event_id}`} passHref>
      <Box p={6}
           rounded="md"
           bg="#1a1a1a"
           color="white"
           _hover={{ bg: "#252525", textDecoration: "none" }}
           height = "165px"
           w="100%"
      >
        <Text fontSize="m" color="white" truncate>
          {event_name}
        </Text>
        <Text fontSize="sm" color="gray.400" mt={1}>
          {event_date}
        </Text>
        {type === "Game" && team_1 && team_2 && (
          <Text mt={1} fontSize="sm">
            {team_1} vs {team_2}
          </Text>
        )}
        <Badge mt={3} variant="subtle" size="lg" colorPalette={badgeColorScheme}>
          {type}
        </Badge>
      </Box>
    </NextLink>
  );
};
