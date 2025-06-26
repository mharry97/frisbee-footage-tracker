import React, { useMemo } from "react";
import {Button, SimpleGrid, HStack, createListCollection} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { AsyncDropdown } from "@/components/async-dropdown";
import {fetchTeams, TeamDetailed} from "@/app/teams/supabase";
import {fetchPlayers, PlayerDetailed} from "@/app/players/supabase";
import {fetchStrategies, Strategy} from "@/app/strategies/supabase";

// This interface defines the shape of our filter form
interface PossessionFilters {
  offenceTeamId?: string[];
  defenceTeamId?: string[];
  outcome?: ('Score' | 'Turnover')[];
  playerId?: string[];
  defenceInit?: string[];
  defenceMain?: string[];
  offenceInit?: string[];
  offenceMain?: string[];
}

// The component receives functions from its parent to call when filters are applied or cleared
interface PossessionFiltersProps {
  onApplyFilters: (filters: Partial<PossessionFilters>) => void;
  onClearFilters: () => void;
}

export function PossessionFilters({ onApplyFilters, onClearFilters }: PossessionFiltersProps) {
  // Set up a local form instance to manage all the filter inputs
  // console.log("EventPageContent is rendering at:", new Date().toLocaleTimeString());
  const { control, handleSubmit, reset } = useForm<PossessionFilters>({
    defaultValues: {
      offenceTeamId: [],
      defenceTeamId: [],
      outcome: [],
      playerId: [],
      defenceInit: [],
      defenceMain: [],
      offenceInit: [],
      offenceMain: []
    },
  });

  // Fetch data needed for the dropdowns
  const { data: teamsData, isLoading: isLoadingTeams } = useQuery({
    queryKey: ['teams'],
    queryFn: fetchTeams,
  });

  const { data: playersData, isLoading: isLoadingPlayers } = useQuery({
    queryKey: ['players'],
    queryFn: fetchPlayers,
  });

  const { data: strategyData, isLoading: isLoadingStrategies } = useQuery({
    queryKey: ['strategies'],
    queryFn: fetchStrategies,
  });

  // Create the collections for the dropdowns
  const teamCollection = useMemo(() => {
    return createListCollection<TeamDetailed>({
      items: teamsData ?? [],
      itemToString: (team) => team.team_name,
      itemToValue: (team) => team.team_id,
    });
  }, [teamsData]);

  const playerCollection = useMemo(() => {
    return createListCollection<PlayerDetailed>({
      items: playersData ?? [],
      itemToString: (player) => player.player_name,
      itemToValue: (player) => player.player_id,
    });
  }, [playersData]);

  const { dInitCollection, dMainCollection, oInitCollection, oMainCollection } = useMemo(() => {
    const allStrategies = strategyData ?? [];

    // Filter the strategies by their type
    const dInit = allStrategies.filter(s => s.play_type === 'defence_initiation');
    const dMain = allStrategies.filter(s => s.play_type === 'defence_main');
    const oInit = allStrategies.filter(s => s.play_type === 'offence_initiation');
    const oMain = allStrategies.filter(s => s.play_type === 'offence_main');

    const createStrategyCollection = (strats: Strategy[]) => createListCollection({
      items: strats,
      itemToString: (strat) => strat.strategy,
      itemToValue: (strat) => strat.strategy_id,
    });

    return {
      dInitCollection: createStrategyCollection(dInit),
      dMainCollection: createStrategyCollection(dMain),
      oInitCollection: createStrategyCollection(oInit),
      oMainCollection: createStrategyCollection(oMain),
    };
  }, [strategyData]);

  const outcomeCollection = useMemo(() => {
    return createListCollection({
      items: ["Score", "Turnover"],
      itemToString: (item) => item,
      itemToValue: (item) => item,
    });
  }, []);

  // Define the submission and clear handlers
  const handleApply = (formData: PossessionFilters) => {
    // Pass the raw form data object up to the parent page
    onApplyFilters(formData);
  };

  const handleClear = () => {
    reset();
    onClearFilters(); // Tell the parent to clear its filters too
  };

  return (
    <form onSubmit={handleSubmit(handleApply)}>
      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap={4} mb={4}>
        <AsyncDropdown
          name="offenceTeamId"
          control={control}
          label="Offence Team"
          placeholder="Any Team"
          collection={teamCollection}
          isLoading={isLoadingTeams}
          itemToKey={(team) => team.team_id}
          renderItem={(team) => team.team_name}
        />
        <AsyncDropdown
          name="defenceTeamId"
          control={control}
          label="Defence Team"
          placeholder="Any Team"
          collection={teamCollection}
          isLoading={isLoadingTeams}
          itemToKey={(team) => team.team_id}
          renderItem={(team) => team.team_name}
        />
        <AsyncDropdown
          name="playerId"
          control={control}
          label="Player"
          placeholder="Any Player"
          collection={playerCollection}
          isLoading={isLoadingPlayers}
          itemToKey={(player) => player.player_id}
          renderItem={(player) => player.player_name}
        />
        <AsyncDropdown
          name="defenceInit"
          control={control}
          label="Defence Initiation"
          placeholder="Any Play"
          collection={dInitCollection}
          isLoading={isLoadingStrategies}
          itemToKey={(strat) => strat.strategy_id}
          renderItem={(strat) => strat.strategy}
        />
        <AsyncDropdown
          name="defenceMain"
          control={control}
          label="Defence Main"
          placeholder="Any Play"
          collection={dMainCollection}
          isLoading={isLoadingStrategies}
          itemToKey={(strat) => strat.strategy_id}
          renderItem={(strat) => strat.strategy}
        />
        <AsyncDropdown
          name="offenceInit"
          control={control}
          label="Offence Initiation"
          placeholder="Any Play"
          collection={oInitCollection}
          isLoading={isLoadingStrategies}
          itemToKey={(strat) => strat.strategy_id}
          renderItem={(strat) => strat.strategy}
        />
        <AsyncDropdown
          name="offenceMain"
          control={control}
          label="Offence Main"
          placeholder="Any Play"
          collection={oMainCollection}
          isLoading={isLoadingStrategies}
          itemToKey={(strat) => strat.strategy_id}
          renderItem={(strat) => strat.strategy}
        />
        <AsyncDropdown
          name="outcome"
          control={control}
          label="Outcome"
          placeholder="Any Outcome"
          collection={outcomeCollection}
          itemToKey={(item) => item}
          renderItem={(item) => item}
        />

      </SimpleGrid>
      <HStack>
        <Button type="submit" colorScheme="blue">Apply Filters</Button>
        <Button variant="ghost" onClick={handleClear}>Clear</Button>
      </HStack>
    </form>
  );
}
