import { type Player, supabase } from "@/lib/supabase";
import { getHomeTeam } from "@/app/teams/supabase";
import {PointDetailed} from "@/app/points/supabase.ts";

// Get home team players
export async function fetchHomePlayers(): Promise<Player[]> {
  const teamId = await getHomeTeam();

  if (!teamId) return [];
  try {
    const { data } = await supabase
      .from("players")
      .select("*")
      .eq("team_id", teamId)
      .order("player_name");
    return data || [];
  } catch (error) {
    console.error("Error fetching players:", error);
    return [];
  }
}


// Get the number of points played by each player
export type PointsByPlayer = PointDetailed & { player_id: string }

export async function getPlayerPointsPlayed(player_id: string):  Promise<PointsByPlayer[]> {
  const { error, data } = await supabase
    .from('view_player_point_detail')
    .select("*")
    .eq("player_id", player_id)
    .order("event_date", { ascending: false })
    .order("event_name", { ascending: true })
    .order("timestamp_seconds", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
