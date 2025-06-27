"use client";

import React from "react";
import {
  Box,
  Button,
  Card,
  HStack,
  SimpleGrid,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { Strategy } from "@/app/strategies/supabase.ts";
import { AddStratModal } from "@/app/strategies/components/strategy-modal.tsx";


function StratCard({ strat }: { strat: Strategy }) {
  const { open, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Card.Root variant="elevated">
        <Card.Header>
          <Card.Title>{strat.strategy}</Card.Title>
        </Card.Header>
        <Card.Body>
          <Card.Description>{strat.description}</Card.Description>
        </Card.Body>
        <Card.Footer gap="2">
          <HStack>
            <Button variant="ghost" colorPalette="gray" onClick={onOpen}>
              Edit
            </Button>
          </HStack>
        </Card.Footer>
      </Card.Root>

      <AddStratModal
        isOpen={open}
        onClose={onClose}
        mode="edit"
        stratToEdit={strat}
      />
    </>
  );
}

// 2. The main StratGrid component becomes much simpler.
interface StratGridProps {
  strats: Strategy[];
}

export function StratGrid({ strats }: StratGridProps) {
  if (!strats || strats.length === 0) {
    return (
      <Box p={4} display="flex" alignItems="center" justifyContent="center">
        <Text color="white" fontSize="lg">
          No strats found.
        </Text>
      </Box>
    );
  }

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} gap={8} mb={8} width="100%">
      {strats.map((item) => (
        <StratCard key={item.strategy_id} strat={item} />
      ))}
    </SimpleGrid>
  );
}
