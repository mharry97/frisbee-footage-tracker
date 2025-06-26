import type { PossessionDetailed } from "@/app/possessions/supabase";
import type { TeamPlayer } from "@/app/players/supabase.ts";


// Single players stat line shape
export interface PlayerStatLine {
  player_id: string;
  player_name: string;
  scores: number;
  assists: number;
  ds: number;
  turnovers: number;
  plus_minus: number;
  points_played: number;
}

export function calculatePlayerStats(
  possessions: PossessionDetailed[],
  playerMapping: TeamPlayer[],
  teamId?: string
): PlayerStatLine[] {
  if (!possessions || possessions.length === 0 || !playerMapping) {
    return [];
  }

  const playerNameMap = new Map(playerMapping.map(p => [p.player_id, p.player_name]));
  const statsTally = new Map<string, Omit<PlayerStatLine, 'plus_minus' | "points_played">>();
  const pointsPlayedTally = new Map<string, Set<string>>();

  // Get name from lookup
  const ensurePlayer = (id: string) => {
    if (!statsTally.has(id)) {
      const name = playerNameMap.get(id) || "Unknown Player";
      statsTally.set(id, { player_id: id, player_name: name, scores: 0, assists: 0, ds: 0, turnovers: 0 });
    }
    return statsTally.get(id)!;
  };

  for (const p of possessions) {
    if (p.is_score) {
      // Tally scores/assists
      if (!teamId || p.offence_team === teamId) {
        if (p.score_player && p.score_player_name) {
          ensurePlayer(p.score_player).scores++;
        }
        if (p.assist_player && p.assist_player_name) {
          ensurePlayer(p.assist_player).assists++;
        }
      }
    } else { // It's a turnover
      // Tally Turnovers
      if (!teamId || p.offence_team === teamId) {
        if (p.turnover_reason === "Drop") {
          if (p.turn_intended_receiver && p.turn_intended_receiver_name) {
            ensurePlayer(p.turn_intended_receiver).turnovers++;
          }
        } else {
          if (p.turn_thrower && p.turn_thrower_name) {
            ensurePlayer(p.turn_thrower).turnovers++;
          }
        }
      }
      // Tally Ds
      if (!teamId || p.defence_team === teamId) {
        if (p.d_player && p.d_player_name) {
          ensurePlayer(p.d_player).ds++;
        }
      }
    }

    // Tally points played
    const allPlayersOnPoint = [...(p.offence_team_players ?? []), ...(p.defence_team_players ?? [])];
    for (const playerId of allPlayersOnPoint) {
      if (playerId) {
        if (!pointsPlayedTally.has(playerId)) {
          pointsPlayedTally.set(playerId, new Set<string>());
        }
        pointsPlayedTally.get(playerId)!.add(p.point_id);
      }
    }
  }

  // Convert back
  const finalStats: PlayerStatLine[] = [];
  for (const [playerId, playerStat] of statsTally.entries()) {
    const uniquePoints = pointsPlayedTally.get(playerId);
    finalStats.push({
      ...playerStat,
      plus_minus: (playerStat.scores + playerStat.assists + playerStat.ds) - playerStat.turnovers,
      points_played: uniquePoints ? uniquePoints.size : 0,
    });
  }

  return finalStats;
}
