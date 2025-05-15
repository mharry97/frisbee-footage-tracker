"use client";

import React from "react";
import NextLink from "next/link";
import { Box, Text } from "@chakra-ui/react";
import { Source } from "@/lib/supabase"

export const SourceCard: React.FC<Source> = ({
  title,
  url,
  recorded_date,
  id
}) => {

  return (
    <Box p={6}
         rounded="md"
         bg="#1a1a1a"
         color="white"
         _hover={{ bg: "#252525", textDecoration: "none" }}
         minH = "150px"
         w="100%"
         position="relative"
    >
      <NextLink href={url}>
        <Box h ="100%"
             w="100%"
        >
          <Text fontSize="lg" mb={2}>
            {title}
          </Text>
          <Text fontSize="sm" mb={2}>
            {recorded_date}
          </Text>
          <Text fontSize="sm" color="gray.400" truncate>
            url: {url}
          </Text>
        </Box>
      </NextLink>
    </Box>
  );
};
