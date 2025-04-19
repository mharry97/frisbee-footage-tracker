"use client";

import React from "react";
import NextLink from "next/link";
import { Box, Text } from "@chakra-ui/react";

export type PointCardProps = {
  point_id: string;
  offence_team: string;
  timestamp: string;
  is_break: boolean;
};

export const PointCard: React.FC<PointCardProps> = ({
  point_id,
  offence_team,
  timestamp,
  is_break,
}) => {
  // Determine the color for the offence team text:
  const offenceColor = is_break ? "red.500" : "green.500";

  return (
    <NextLink href={`/points/${point_id}`} passHref>
      <Box p={6}
           rounded="md"
           bg="#1a1a1a"
           color="white"
           _hover={{ bg: "#252525", textDecoration: "none" }}
           height = "100px"
           w="100%"
      >
        <Text fontSize="lg" color={offenceColor} mb={2}>
          Offence: {offence_team}
        </Text>
        <Text fontSize="sm" color="gray.400">
          Timestamp: {timestamp}
        </Text>
      </Box>
    </NextLink>
  );
};
