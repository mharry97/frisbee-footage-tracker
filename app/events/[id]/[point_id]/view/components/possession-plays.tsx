import React from "react";
import { Text, GridItem, Box } from "@chakra-ui/react";

export type PossessionPlayProps = {
  d_init: string;
  d_main: string;
  o_init: string;
  o_main: string;
};

export default function PossessionPlays({
                                          d_init,
                                          d_main,
                                          o_init,
                                          o_main,
                                        }: PossessionPlayProps) {
  return (
    <Box
      display="grid"
      gridTemplateColumns="auto auto auto"
      gap={4}
      p={4}
      rounded="md"
      justifyContent="center"
    >
      <GridItem />
      <GridItem>
        <Text fontWeight="bold" color="gray.300">Initiation</Text>
      </GridItem>
      <GridItem>
        <Text fontWeight="bold" color="gray.300">Main</Text>
      </GridItem>

      <GridItem>
        <Text fontWeight="bold">O</Text>
      </GridItem>
      <GridItem>
        <Text fontWeight="bold" color="yellow.400">{o_init}</Text>
      </GridItem>
      <GridItem>
        <Text fontWeight="bold" color="yellow.400">{o_main}</Text>
      </GridItem>

      <GridItem>
        <Text fontWeight="bold">D</Text>
      </GridItem>
      <GridItem>
        <Text fontWeight="bold" color="yellow.400">{d_init}</Text>
      </GridItem>
      <GridItem>
        <Text fontWeight="bold" color="yellow.400">{d_main}</Text>
      </GridItem>
    </Box>
  );
}
