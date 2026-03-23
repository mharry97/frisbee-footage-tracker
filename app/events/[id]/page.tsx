"use client";

import React, { useMemo, useState } from "react";
import NextLink from "next/link";
import LoadingSpinner from "@/components/ui/loading-spinner";
import CustomTabs from "@/components/tabbed-page";
import { fetchEventPoints } from "@/app/points/supabase";
import { fetchEventPossessions } from "@/app/possessions/supabase";
import {baseUrlToTimestampUrl, convertTimestampToSeconds} from "@/lib/utils";
import { fetchClipsCustom } from "@/app/clips/supabase";
import {useParams} from "next/navigation";
import {useAuth} from "@/lib/auth-context.tsx";
import StandardHeader from "@/components/standard-header.tsx";
import {AuthWrapper} from "@/components/auth-wrapper.tsx";
import OnPageVideoLink from "@/components/on-page-video-link.tsx";
import PointForm from "@/app/events/[id]/components/new-point-form.tsx";
import {useQuery} from "@tanstack/react-query";
import ScoreProgressionChart from "@/app/stats/game/components/ScoreProgressionChart.tsx";
import {transformPointsForScoreChart} from "@/app/stats/game/game-flow.ts";
import {fetchEvent} from "@/app/events/supabase.ts";
import {CalculatedStat, calculateGameStats} from "@/app/stats/game/game-stats.ts";
import {StatRow} from "@/app/stats/game/components/StatRow.tsx";
import {ClipGrid} from "@/app/clips/components/clip-grid.tsx";
import {PlayerStatsTable} from "@/app/stats/player/components/player-stat-table.tsx";
import {calculatePlayerStats} from "@/app/stats/player/player-base-stats.ts";
import {fetchTeamMapping} from "@/app/players/supabase.ts";
import { CustomModal } from "@/components/modal";
import { CardGrid } from "@/components/card-grid";
import { Card, CardHeader, CardBody } from "@/components/card";

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 mb-4 mt-4">
      <hr className="flex-1 border-neutral-700" />
      <span className="text-xl shrink-0">{label}</span>
      <hr className="flex-1 border-neutral-700" />
    </div>
  );
}

function EventPageContent() {
  const { id } = useParams<{ id: string }>();
  const { player } = useAuth();
  const [quickViewUrl, setQuickViewUrl] = useState<string | null>(null);

  const { data: points, isLoading: isLoadingPoints } = useQuery({
    queryKey: ['points', id],
    queryFn: () => fetchEventPoints(id),
    enabled: !!id,
  });

  const { data: possessions, isLoading: isLoadingPossessions } = useQuery({
    queryKey: ['possessions', id],
    queryFn: () => fetchEventPossessions(id),
    enabled: !!id,
  });

  const { data: event, isLoading: isLoadingEvent } = useQuery({
    queryKey: ['event', id],
    queryFn: () => fetchEvent(id),
    enabled: !!id,
  });

  const { data: playerTeamMapping, isLoading: isLoadingTeamPlayer } = useQuery({
    queryFn: fetchTeamMapping,
    queryKey: ["teamPlayer"]
  });

  const isLoading = isLoadingPossessions || isLoadingPoints || isLoadingEvent || isLoadingTeamPlayer;
  const hasPoints = points?.length != 0;

  const scoreData = useMemo(() => {
    if (!points || points.length === 0) return [];
    const scoreTally: { [key: string]: number } = {};
    for (const point of points) {
      let scoringTeamName: string | null = null;
      if (point.point_outcome === 'hold') scoringTeamName = point.offence_team_name;
      else if (point.point_outcome === 'break') scoringTeamName = point.defence_team_name;
      if (scoringTeamName) {
        scoreTally[scoringTeamName] = (scoreTally[scoringTeamName] || 0) + 1;
      }
    }
    return Object.entries(scoreTally).map(([teamName, score]) => ({ name: teamName, value: score }));
  }, [points]);

  const scoreChartData = useMemo(() => {
    if (!points || !event) return [];
    return transformPointsForScoreChart(points, event);
  }, [points, event]);

  const gameStats = useMemo(() => {
    if (!points || !event || !possessions) return [] as CalculatedStat[];
    return calculateGameStats(points, possessions, event);
  }, [points, possessions, event]);

  const allPlayerStats = useMemo(() =>
    calculatePlayerStats(possessions ?? [], playerTeamMapping ?? []),
    [possessions, playerTeamMapping]
  );

  const filteredPlayerStats = useMemo(() => {
    if (!allPlayerStats) return [];
    return allPlayerStats.filter(p => p.points_played > 0);
  }, [allPlayerStats]);

  const PointsContent = () => {
    const sortedPoints = [...(points ?? [])].sort(
      (a, b) => convertTimestampToSeconds(a.timestamp) - convertTimestampToSeconds(b.timestamp)
    );
    if (!hasPoints) {
      return (
        <>
          <div className="flex items-center justify-center py-16">
            <p className="text-lg">No points for this event yet.</p>
          </div>
          <PointForm event_id={id} />
        </>
      );
    }
    return (
      <>
        <CardGrid>
          {sortedPoints.map((item, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <p className="font-medium">Offence: {item.offence_team_name}</p>
                  {item.point_outcome === "break" ? (
                    <span className="px-2 py-0.5 rounded text-xs bg-red-900 text-red-200">Break</span>
                  ) : item.point_outcome === "hold" ? (
                    <span className="px-2 py-0.5 rounded text-xs bg-green-900 text-green-200">Hold</span>
                  ) : null}
                </div>
                <p className="text-sm text-neutral-400 mt-1">{item.timestamp}</p>
              </CardHeader>
              <CardBody>
                {item.point_outcome === "unknown" ? (
                  <p className="text-sm text-neutral-400">Point has not been fully statted.</p>
                ) : (
                  <div className="text-sm mb-3">
                    <p>Assist: {item.assist_player_name || "Unknown"}</p>
                    <p>Score: {item.score_player_name || "Unknown"}</p>
                    <p className="text-neutral-400 mt-1">
                      {item.possession_number - 1}{item.possession_number === 2 ? " Turn" : " Turns"}
                    </p>
                  </div>
                )}
                <div className="flex gap-2">
                  <NextLink href={`/events/${item.event_id}/${item.point_id}/view`} passHref>
                    <button className="px-3 py-1.5 rounded bg-neutral-700 hover:bg-neutral-600 text-sm transition-colors">
                      Details
                    </button>
                  </NextLink>
                  <button
                    className="px-3 py-1.5 rounded bg-transparent hover:bg-neutral-700 text-sm transition-colors"
                    onClick={() => setQuickViewUrl(baseUrlToTimestampUrl(item.base_url, item.timestamp))}
                  >
                    Quick View
                  </button>
                </div>
              </CardBody>
            </Card>
          ))}
        </CardGrid>
        <PointForm event_id={id} />
      </>
    );
  };

  const OverviewContent = () => {
    if (!hasPoints || !event) {
      return (
        <div className="flex items-center justify-center py-16">
          <p className="text-lg">No stats for this event yet.</p>
        </div>
      );
    }
    return (
      <>
        <div className="flex flex-col items-center mb-8 mt-4">
          {event.notes && (
            <p className="mt-0 mb-4 text-neutral-400 text-sm">*Note: {event.notes}</p>
          )}
          <p className="text-xl mb-4">Score</p>
          <div className="grid w-full max-w-lg px-4 py-4 gap-6" style={{ gridTemplateColumns: '1fr auto 1fr' }}>
            <div className="flex flex-col items-end gap-4 min-w-0">
              {scoreData.map((team) => (
                <h2 key={team.name} className="text-base font-semibold text-right truncate w-full">{team.name}</h2>
              ))}
            </div>
            <div className="w-px bg-yellow-400" />
            <div className="flex flex-col items-start gap-4 min-w-0">
              {scoreData.map((team) => (
                <h2 key={team.name + "-score"} className="text-base font-semibold">{team.value}</h2>
              ))}
            </div>
          </div>
        </div>

        <SectionDivider label="Game Flow" />
        <div className="h-72 w-full mt-4 mb-4">
          <ScoreProgressionChart
            data={scoreChartData}
            teamOneName={event?.team_1 ?? 'Team 1'}
            teamTwoName={event?.team_2 ?? 'Team 2'}
          />
        </div>

        <SectionDivider label="Team Stats" />
        <div className="flex flex-col gap-6 w-full">
          <div className="grid w-full grid-cols-3">
            <h2 className="text-left font-semibold truncate">{event?.team_1}</h2>
            <div />
            <h2 className="text-right font-semibold truncate">{event?.team_2}</h2>
          </div>
          {(gameStats ?? []).map((stat) => (
            <StatRow
              key={stat.label}
              label={stat.label}
              teamOneValue={stat.teamOneValue}
              teamTwoValue={stat.teamTwoValue}
              isPercentage={stat.isPercentage}
            />
          ))}
        </div>

        <SectionDivider label="Player Stats" />
        <PlayerStatsTable data={filteredPlayerStats} />
      </>
    );
  };

  const ClipsContent = () => {
    const { data: clips, isLoading } = useQuery({
      queryKey: ["clips", { eventId: id, requestPlayerId: player?.auth_user_id }],
      queryFn: () => fetchClipsCustom({ eventId: id, requestPlayer: player!.auth_user_id }),
      enabled: !!id && !!player,
    });
    if (isLoading) return <LoadingSpinner text="Loading clips..." />;
    if (!player) return <p>Who are you</p>;
    return <ClipGrid clips={clips ?? []} playerId={player.player_id} />;
  };

  const tabs = [
    { value: "overview", label: "Overview", content: <OverviewContent /> },
    { value: "points", label: "Points", content: <PointsContent /> },
    { value: "clips", label: "Clips", content: <ClipsContent /> },
  ];

  if (!player || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading event data...</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <StandardHeader text={event?.event_name ?? ""} />
      {isLoading ? (
        <LoadingSpinner text="Loading..." />
      ) : (
        <CustomTabs defaultValue="overview" tabs={tabs} />
      )}
      <div className="h-12" />

      <CustomModal isOpen={!!quickViewUrl} onClose={() => setQuickViewUrl(null)} title="Quick View">
        {quickViewUrl && <OnPageVideoLink url={quickViewUrl} />}
      </CustomModal>
    </div>
  );
}

export default function EventPage() {
  return (
    <AuthWrapper>
      <EventPageContent />
    </AuthWrapper>
  )
}
