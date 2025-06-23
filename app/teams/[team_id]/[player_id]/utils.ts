import { PossessionDetailed } from "@/app/possessions/supabase";

const THROWAWAY_REASONS = ["Throw Away", "Stallout", "Hand/Foot Block"];
const DROP_REASONS = ["Drop"];

export interface PlayerStats {
  player_id: string;
  scores: number;
  assists: number;
  ds: number;
  throwaways: number;
  drops: number;
  plusMinus: number;
}

export function getPlayerStatsFromPossessions(data: PossessionDetailed[]): Record<string, PlayerStats> {
  const statsMap: Record<string, PlayerStats> = {};

  for (const point of data) {
    const playerEntries: [string | null, keyof PlayerStats][] = [
      [point.score_player, "scores"],
      [point.assist_player, "assists"],
      [point.d_player, "ds"]
    ];

    for (const [id, statKey] of playerEntries) {
      if (!id) continue;
      if (!statsMap[id]) {
        statsMap[id] = {
          player_id: id,
          scores: 0,
          assists: 0,
          ds: 0,
          throwaways: 0,
          drops: 0,
          plusMinus: 0,
        };
      }

      statsMap[id][statKey]++;
    }

    // Turnovers
    if (point.turn_thrower && point.turnover_reason && THROWAWAY_REASONS.includes(point.turnover_reason)) {
      const id = point.turn_thrower;
      if (!statsMap[id]) {
        statsMap[id] = {
          player_id: id,
          scores: 0,
          assists: 0,
          ds: 0,
          throwaways: 0,
          drops: 0,
          plusMinus: 0,
        };
      }
      statsMap[id].throwaways++;
    }

    if (point.turn_intended_receiver && point.turnover_reason && DROP_REASONS.includes(point.turnover_reason)) {
      const id = point.turn_intended_receiver;
      if (!statsMap[id]) {
        statsMap[id] = {
          player_id: id,
          scores: 0,
          assists: 0,
          ds: 0,
          throwaways: 0,
          drops: 0,
          plusMinus: 0,
        };
      }
      statsMap[id].drops++;
    }
  }

  // Calculate +/- for each player
  for (const stat of Object.values(statsMap)) {
    stat.plusMinus = stat.scores + stat.assists + stat.ds - stat.throwaways - stat.drops;
  }

  return statsMap;
}
