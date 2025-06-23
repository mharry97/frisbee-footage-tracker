// Utility functions for transforming supabase responses into specific stat formats
import {TeamPlayer} from "@/app/teams/[team_id]/[player_id]/supabase.ts";
import {PossessionDetailed} from "@/app/possessions/supabase.ts";
import type { EventDetail } from "@/app/events/supabase";
import type { PointDetailed } from "@/app/points/supabase";
import { convertTimestampToSeconds } from "@/lib/utils";

// Get player level info from possessions
interface PlayerStats {
  player_id: string;
  player_name: string;
  team_id: string;
  team_name: string;
  ds: number;
  scores: number;
  assists: number;
  drops: number;
  throwAways: number;
}

export function playerStats(
  possessions: PossessionDetailed[],
  teamPlayerMapping: TeamPlayer[]
): PlayerStats[] {
  const mapping = Object.fromEntries(
    teamPlayerMapping.map((p) => [p.player_id, p])
  ) as Record<string, TeamPlayer>;

  const statsMap = new Map<string, PlayerStats>();

  const increment = (
    playerId: string | null,
    stat: keyof Omit<PlayerStats, "player_id" | "player_name" | "team_id" | "team_name">
  ) => {
    if (!playerId) return;
    const meta = mapping[playerId];
    if (!meta) return;

    if (!statsMap.has(playerId)) {
      statsMap.set(playerId, {
        player_id: playerId,
        player_name: meta.player_name,
        team_id: meta.team_id,
        team_name: meta.team_name,
        ds: 0,
        scores: 0,
        assists: 0,
        drops: 0,
        throwAways: 0,
      });
    }

    statsMap.get(playerId)![stat]++;
  };

  for (const possession of possessions) {
    increment(possession.d_player, "ds");
    increment(possession.score_player, "scores");
    increment(possession.assist_player, "assists");

    if (possession.turnover_reason === "Drop") {
      increment(possession.turn_intended_receiver, "drops");
    }

    if (possession.turnover_reason === "Throw Away") {
      increment(possession.turn_thrower, "throwAways");
    }
  }

  return Array.from(statsMap.values());
}

// Get team level info from possessions
interface TeamStats {
  team_id: string;
  team_name: string;
  Turns: number;
  Scores: number;
  Possessions: number;
  Breaks: number;
}

export function teamStats(
  possessions: PossessionDetailed[],
  teamMapping: { team_id: string; team_name: string }[]
): TeamStats[] {
  const teamIdToName = Object.fromEntries(
    teamMapping.map((t) => [t.team_id, t.team_name])
  );

  const statsMap = new Map<string, TeamStats>();

  const ensureTeam = (teamId: string) => {
    if (!statsMap.has(teamId)) {
      statsMap.set(teamId, {
        team_id: teamId,
        team_name: teamIdToName[teamId] ?? `Unknown (${teamId})`,
        Turns: 0,
        Scores: 0,
        Possessions: 0,
        Breaks: 0,
      });
    }
  };

  for (const possession of possessions) {
    // Count Possessions
    ensureTeam(possession.offence_team);
    statsMap.get(possession.offence_team)!.Possessions++;

    // Count Scores
    if (possession.is_score) {
      ensureTeam(possession.offence_team);
      statsMap.get(possession.offence_team)!.Scores++;

      // Count Breaks
      if (possession.possession_number % 2 === 0) {
        ensureTeam(possession.offence_team);
        statsMap.get(possession.offence_team)!.Breaks++;
      }
    }

    // Count Turnovers
    if (!possession.is_score) {
      ensureTeam(possession.offence_team);
      statsMap.get(possession.offence_team)!.Turns++;
    }
  }

  return Array.from(statsMap.values());
}


// Collect the number of possessions for each sequence of offence/defence strategies
export interface SequenceStat {
  team_id: string;
  team_name: string;
  initiation: string;
  main: string;
  role: "offence" | "defence";
  count: number;
}

export function sequenceStats(
  possessions: PossessionDetailed[],
  teamMapping: { team_id: string; team_name: string }[]
): SequenceStat[] {
  const teamIdToName = Object.fromEntries(
    teamMapping.map((t) => [t.team_id, t.team_name])
  );

  const sequenceMap = new Map<string, SequenceStat>();

  for (const p of possessions) {
    const entries: [string, string | null, string | null, "offence" | "defence"][] = [
      [p.offence_team, p.offence_init_name, p.offence_main_name, "offence"],
      [p.defence_team, p.defence_init_name, p.defence_main_name, "defence"],
    ];

    for (const [teamId, init, main, role] of entries) {
      const key = `${teamId}-${init ?? "None"}-${main ?? "None"}-${role}`;
      if (!sequenceMap.has(key)) {
        sequenceMap.set(key, {
          team_id: teamId,
          team_name: teamIdToName[teamId] ?? `Unknown (${teamId})`,
          initiation: init ?? "None",
          main: main ?? "None",
          role,
          count: 0,
        });
      }
      sequenceMap.get(key)!.count++;
    }
  }

  return Array.from(sequenceMap.values());
}


// Game flow chart
// Define the shape of data required
export type ScoreChartDataPoint = {
  pointNumber: number;
  teamOneScore: number;
  teamTwoScore: number;
};

export function transformPointsForScoreChart(
  points: PointDetailed[],
  eventData: EventDetail | null
): ScoreChartDataPoint[] {
  if (!points || !eventData) {
    return [];
  }

  // Ensure points are in chronological order
  const sortedPoints = [...points].sort(
    (a, b) =>
      convertTimestampToSeconds(a.timestamp) - convertTimestampToSeconds(b.timestamp)
  );

  const chartData: ScoreChartDataPoint[] = [{ pointNumber: 0, teamOneScore: 0, teamTwoScore: 0 }];

  let teamOneScore = 0;
  let teamTwoScore = 0;

  const teamOneName = eventData.team_1;
  const teamTwoName = eventData.team_2;

  sortedPoints.forEach((point, index) => {
    const pointNumber = index + 1;
    let scoringTeamName: string | null = null;

    if (point.point_outcome === 'hold') {
      scoringTeamName = point.offence_team_name;
    } else if (point.point_outcome === 'break') {
      scoringTeamName = point.defence_team_name;
    }

    if (scoringTeamName === teamOneName) {
      teamOneScore++;
    } else if (scoringTeamName === teamTwoName) {
      teamTwoScore++;
    }

    chartData.push({
      pointNumber,
      teamOneScore,
      teamTwoScore,
    });
  });

  return chartData;
}
