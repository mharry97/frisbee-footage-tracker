"use client"
import {
  Container,
  Box,
  Text, VStack, useDisclosure,
} from "@chakra-ui/react";
import { AuthWrapper } from "@/components/auth-wrapper";
import { useAuth } from "@/lib/auth-context.tsx";
import React, {useMemo} from "react";

import StandardHeader from "@/components/standard-header.tsx";
import CustomTabs from "@/components/tabbed-page.tsx";
import {useQuery} from "@tanstack/react-query";
import {fetchStrategies} from "@/app/strategies/supabase.ts";
import {StratGrid} from "@/app/strategies/components/strat-grid.tsx";
import LoadingSpinner from "@/components/ui/loading-spinner.tsx";
import FloatingActionButton from "@/components/ui/floating-plus.tsx";
import {AddStratModal} from "@/app/strategies/components/strategy-modal.tsx";

function StrategyPageContent() {
  const { player } = useAuth();
  const { open, onOpen, onClose } = useDisclosure();

  const { data: strats, isLoading } = useQuery({
    queryFn: fetchStrategies,
    queryKey: ["strats"]
  })

  const {
    offenceInitiationStrats,
    offenceMainStrats,
    defenceInitiationStrats,
    defenceMainStrats
  } = useMemo(() => {
    const allStrats = strats ?? [];
    return {
      offenceInitiationStrats: allStrats.filter(s => s.play_type === 'offence_initiation'),
      offenceMainStrats: allStrats.filter(s => s.play_type === 'offence_main'),
      defenceInitiationStrats: allStrats.filter(s => s.play_type === 'defence_initiation'),
      defenceMainStrats: allStrats.filter(s => s.play_type === 'defence_main'),
    };
  }, [strats]);


  if (!player || isLoading) {
    return (
      <Box minH="100vh" p={4} display="flex" alignItems="center" justifyContent="center">
        <Text color="white" fontSize="lg">Loading strategies...</Text>
      </Box>
    );
  }

  // Offence
  const OffenceContent = () => {
    if (isLoading) {
      return <LoadingSpinner text="Loading strats..." />;
    }
    return (
      <>
        <VStack gap={2}>
          <Text mb={4} mt={4} textStyle="2xl">Initiation Plays</Text>
          <StratGrid strats={offenceInitiationStrats ?? []} />
          <Text mb={4} mt={4} textStyle="2xl">Main Plays</Text>
          <StratGrid strats={offenceMainStrats ?? []} />
        </VStack>
      </>
    );
  };

  // Defence
  const DefenceContent = () => {
    if (isLoading) {
      return <LoadingSpinner text="Loading strats..." />;
    }
    return (
      <>
        <VStack gap={2}>
          <Text mb={4} mt={4} textStyle="2xl">Initiation Plays</Text>
          <StratGrid strats={defenceInitiationStrats ?? []} />
          <Text mb={4} mt={4} textStyle="2xl">Main Plays</Text>
          <StratGrid strats={defenceMainStrats ?? []} />
        </VStack>
      </>
    );
  };


  const tabs = [
    {
      value: "defence",
      label: "Defence",
      content: <DefenceContent />,
    },
    {
      value: "offence",
      label: "Offence",
      content: <OffenceContent />,
    },
  ];


  return (
    <Container maxW="4xl">
      <StandardHeader text="Strategies" is_admin={player.is_admin} />
      <CustomTabs defaultValue="defence" tabs={tabs} />
      <FloatingActionButton onClick={onOpen} iconType="add" />
      <AddStratModal
        isOpen={open}
        onClose={onClose}
        mode="add"
      />
    </Container>
  )

}


export default function StrategyPage() {
  return (
    <AuthWrapper>
      <StrategyPageContent />
    </AuthWrapper>
  );
}

