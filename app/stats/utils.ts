// Utility functions for transforming supabase responses into specific stat formats
import type {PointDetailed, Possession, TeamPlayer} from "@/lib/supabase";

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
  possessions: Possession[],
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
  possessions: Possession[],
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
  possessions: Possession[],
  teamMapping: { team_id: string; team_name: string }[]
): SequenceStat[] {
  const teamIdToName = Object.fromEntries(
    teamMapping.map((t) => [t.team_id, t.team_name])
  );

  const sequenceMap = new Map<string, SequenceStat>();

  for (const p of possessions) {
    const entries: [string, string | null, string | null, "offence" | "defence"][] = [
      [p.offence_team, p.offence_init, p.offence_main, "offence"],
      [p.defence_team, p.defence_init, p.defence_main, "defence"],
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


const isThrowaway = (row: PointDetailed, playerId: string) =>
  row.turn_thrower === playerId &&
  ["Throw Away", "Stallout", "Hand/Foot Block"].includes(row.turnover_reason ?? "");

const isDrop = (row: PointDetailed, playerId: string) =>
  row.turn_thrower === playerId && row.turnover_reason === "Drop";

// Get all player stats
// export function getPlayerStats(points: PointDetailed[]) {
//   const statsMap: Record<string, any> = {}
//
//   for (const row of points) {
//     const playerIds = [
//       row.score_player,
//       row.assist_player,
//       row.d_player,
//       row.turn_thrower
//     ].filter(Boolean)
//
//     for (const pid of new Set(playerIds)) {
//       if (!pid) continue
//       if (!statsMap[pid]) {
//         statsMap[pid] = {
//           player_id: pid,
//           player_name:
//             row.score_player === pid ? row.score_player_name
//               : row.assist_player === pid ? row.assist_player_name
//                 : row.d_player === pid ? row.d_player_name
//                   : row.turn_thrower === pid ? row.turn_thrower_name
//                     : "",
//           scores: 0,
//           assists: 0,
//           ds: 0,
//           throwaways: 0,
//           drops: 0,
//           plusMinus: 0,
//         }
//       }
//
//       const stats = statsMap[pid]
//
//       if (row.score_player === pid) stats.scores++
//       if (row.assist_player === pid) stats.assists++
//       if (row.d_player === pid) stats.ds++
//       if (isThrowaway(row, pid)) stats.throwaways++
//       if (isDrop(row, pid)) stats.drops++
//
//       stats.plusMinus =
//         stats.scores + stats.assists + stats.ds - stats.throwaways - stats.drops
//     }
//   }
//
//   return Object.values(statsMap)
// }
//
// // Get player stats by game
// export function getPlayerStatsByGame(points: PointDetailed[]) {
//   const groupedStats: Record<string, any> = {}
//
//   for (const row of points) {
//     const gameId = row.event_id
//     const gameKey = `${row.event_id}__${row.score_player || row.assist_player || row.d_player || row.turn_thrower}`
//
//     const playerIds = [row.score_player, row.assist_player, row.d_player, row.turn_thrower].filter(Boolean)
//
//     for (const pid of new Set(playerIds)) {
//       if (!pid) continue
//
//       const key = `${gameId}__${pid}`
//
//       if (!groupedStats[key]) {
//         groupedStats[key] = {
//           event_id: row.event_id,
//           event_name: row.event_name,
//           player_id: pid,
//           player_name:
//             row.score_player === pid ? row.score_player_name
//               : row.assist_player === pid ? row.assist_player_name
//                 : row.d_player === pid ? row.d_player_name
//                   : row.turn_thrower === pid ? row.turn_thrower_name
//                     : "",
//           scores: 0,
//           assists: 0,
//           ds: 0,
//           throwaways: 0,
//           drops: 0,
//           plusMinus: 0,
//         }
//       }
//
//       const stats = groupedStats[key]
//
//       if (row.score_player === pid) stats.scores++
//       if (row.assist_player === pid) stats.assists++
//       if (row.d_player === pid) stats.ds++
//       if (isThrowaway(row, pid)) stats.throwaways++
//       if (isDrop(row, pid)) stats.drops++
//
//       stats.plusMinus =
//         stats.scores + stats.assists + stats.ds - stats.throwaways - stats.drops
//     }
//   }
//
//   return Object.values(groupedStats)
// }
//
//
//
//
