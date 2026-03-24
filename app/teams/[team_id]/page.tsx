"use client";

import { useAuth } from "@/lib/auth-context.tsx";
import { AuthWrapper } from "@/components/auth-wrapper.tsx";
import React, { useMemo, useState } from "react";
import StandardHeader from "@/components/standard-header.tsx";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchTeam } from "@/app/teams/supabase.ts";
import CustomTabs from "@/components/tabbed-page.tsx";
import { fetchClipsCustom } from "@/app/clips/supabase.ts";
import LoadingSpinner from "@/components/ui/loading-spinner.tsx";
import { ClipGrid } from "@/app/clips/components/clip-grid.tsx";
import { fetchTeamMapping, getPlayersForTeam } from "@/app/players/supabase.ts";
import { PlayerGrid } from "@/components/ui/player-grid.tsx";
import { PlayerModal } from "@/app/players/components/player-modal.tsx";
import FloatingActionButton from "@/components/ui/floating-plus.tsx";
import { fetchTeamPossessions } from "@/app/possessions/supabase.ts";
import { calculatePlayerStats, PlayerStatLine } from "@/app/stats/player/player-base-stats.ts";
import { StatLeaderCard } from "@/app/stats/player/components/player-stat-card.tsx";
import { PlayerStatsTable } from "@/app/stats/player/components/player-stat-table.tsx";

function TeamPageContent() {
  const { player } = useAuth()
  const { team_id } = useParams<{ team_id: string }>();
  const [addPlayerOpen, setAddPlayerOpen] = useState(false);

  const { data: teamData, isLoading: isLoadingTeam } = useQuery({
    queryFn: () => fetchTeam(team_id),
    queryKey: ["team"]
  })

  const { data: playerTeamMapping, isLoading: isLoadingTeamPlayer } = useQuery({
    queryFn: fetchTeamMapping,
    queryKey: ["teamPlayer"]
  })

  const { data: possessionData, isLoading: isLoadingPossessions } = useQuery({
    queryKey: ["teamPossessions", team_id],
    queryFn: () => fetchTeamPossessions(team_id),
    enabled: !!team_id,
  });

  const allPlayerStats = useMemo(
    () => calculatePlayerStats(possessionData ?? [], playerTeamMapping ?? [], team_id),
    [possessionData, team_id, playerTeamMapping]
  );

  const filteredPlayerStats = useMemo(
    () => (allPlayerStats ?? []).filter(p => p.points_played > 0),
    [allPlayerStats]
  );

  const leaders = useMemo(() => {
    if (!filteredPlayerStats || filteredPlayerStats.length === 0) return {};
    const findLeader = (stat: keyof PlayerStatLine) =>
      filteredPlayerStats.reduce((top, current) => (current[stat] > top[stat] ? current : top));
    return {
      topScorer: findLeader('scores'),
      topAssister: findLeader('assists'),
      topDefender: findLeader('ds'),
      topPlusMinus: findLeader('plus_minus'),
    };
  }, [filteredPlayerStats]);

  const isLoading = isLoadingTeam || isLoadingPossessions || isLoadingTeamPlayer;

  if (!player || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading team data...</p>
      </div>
    );
  }

  if (!teamData) {
    return (
      <div>
        <StandardHeader text="Teams" />
        <p>Team does not exist</p>
      </div>
    )
  }

  const OverviewContent = () => (
    <div className="flex flex-col gap-8">
      <h2 className="text-lg font-medium text-center">Top Players</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatLeaderCard label="Scores" player={leaders.topScorer} statValue={leaders.topScorer?.scores} />
        <StatLeaderCard label="Assists" player={leaders.topAssister} statValue={leaders.topAssister?.assists} />
        <StatLeaderCard label="Ds" player={leaders.topDefender} statValue={leaders.topDefender?.ds} />
        <StatLeaderCard label="+/-" player={leaders.topPlusMinus} statValue={leaders.topPlusMinus?.plus_minus} />
      </div>
      <div className="flex items-center gap-4 mb-4 mt-4">
        <hr className="flex-1 border-neutral-700" />
        <span className="text-xl shrink-0">Overview</span>
        <hr className="flex-1 border-neutral-700" />
      </div>
      <PlayerStatsTable data={filteredPlayerStats} />
    </div>
  );

  const PlayersContent = () => {
    const { data: players, isLoading } = useQuery({
      queryKey: ["players", team_id],
      queryFn: () => getPlayersForTeam(team_id),
      enabled: !!team_id && !!player,
    });
    const { activePlayers, inactivePlayers } = useMemo(() => {
      if (!players) return { activePlayers: [], inactivePlayers: [] };
      return {
        activePlayers: players.filter(p => p.is_active),
        inactivePlayers: players.filter(p => !p.is_active),
      };
    }, [players]);

    if (isLoading) return <LoadingSpinner text="Loading players..." />;
    return (
      <>
        <p className="mb-4 mt-4 text-2xl">Active Players</p>
        <PlayerGrid players={activePlayers ?? []} />
        <p className="mb-4 mt-4 text-2xl">Inactive Players</p>
        <PlayerGrid players={inactivePlayers ?? []} />
        <FloatingActionButton onClick={() => setAddPlayerOpen(true)} iconType="add" />
        <PlayerModal
          isOpen={addPlayerOpen}
          onClose={() => setAddPlayerOpen(false)}
          mode="add"
          teamId={team_id}
        />
      </>
    );
  }

  const ClipsContent = () => {
    const { data: clips, isLoading } = useQuery({
      queryKey: ["customClips", { teamId: team_id, requestPlayerId: player?.auth_user_id }],
      queryFn: () => fetchClipsCustom({ teamId: team_id, requestPlayer: player!.auth_user_id }),
      enabled: !!team_id && !!player,
    });
    if (isLoading) return <LoadingSpinner text="Loading clips..." />;
    return <ClipGrid clips={clips ?? []} playerId={player.player_id} />;
  };

  const tabs = [
    { value: "overview", label: "Overview", content: <OverviewContent /> },
    { value: "players", label: "Players", content: <PlayersContent /> },
    { value: "clips", label: "Clips", content: <ClipsContent /> },
  ];

  return (
    <div>
      <StandardHeader text={teamData.team_name} />
      <CustomTabs defaultValue="overview" tabs={tabs} />
    </div>
  )
}

export default function TeamsPage() {
  return (
    <AuthWrapper>
      <TeamPageContent />
    </AuthWrapper>
  )
}
