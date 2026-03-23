import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { AsyncDropdown } from "@/components/async-dropdown";
import { fetchTeams, TeamDetailed } from "@/app/teams/supabase";
import { fetchPlayers, PlayerDetailed } from "@/app/players/supabase";
import { fetchStrategies, Strategy } from "@/app/strategies/supabase";

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

interface PossessionFiltersProps {
  onApplyFilters: (filters: Partial<PossessionFilters>) => void;
  onClearFilters: () => void;
}

export function PossessionFilters({ onApplyFilters, onClearFilters }: PossessionFiltersProps) {
  const { control, handleSubmit, reset } = useForm<PossessionFilters>({
    defaultValues: {
      offenceTeamId: [],
      defenceTeamId: [],
      outcome: [],
      playerId: [],
      defenceInit: [],
      defenceMain: [],
      offenceInit: [],
      offenceMain: [],
    },
  });

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

  const teamCollection = useMemo(() => ({ items: teamsData ?? [] }), [teamsData]);
  const playerCollection = useMemo(() => ({ items: playersData ?? [] }), [playersData]);

  const { dInitCollection, dMainCollection, oInitCollection, oMainCollection } = useMemo(() => {
    const all = strategyData ?? [];
    return {
      dInitCollection: { items: all.filter(s => s.play_type === 'defence_initiation') },
      dMainCollection: { items: all.filter(s => s.play_type === 'defence_main') },
      oInitCollection: { items: all.filter(s => s.play_type === 'offence_initiation') },
      oMainCollection: { items: all.filter(s => s.play_type === 'offence_main') },
    };
  }, [strategyData]);

  const outcomeCollection = useMemo(() => ({ items: ["Score", "Turnover"] }), []);

  const handleApply = (formData: PossessionFilters) => {
    onApplyFilters(formData);
  };

  const handleClear = () => {
    reset();
    onClearFilters();
  };

  return (
    <form onSubmit={handleSubmit(handleApply)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 rounded bg-neutral-700 hover:bg-neutral-600 text-sm transition-colors"
        >
          Apply Filters
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="px-4 py-2 rounded hover:bg-neutral-800 text-sm transition-colors text-neutral-400"
        >
          Clear
        </button>
      </div>
    </form>
  );
}
