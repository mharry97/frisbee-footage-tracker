import { type Player, supabase } from "@/lib/supabase";
import { getHomeTeam } from "@/app/teams/supabase";



// Get home team players
export async function fetchHomePlayers(): Promise<Player[]> {
  const teamId = await getHomeTeam();

  if (!teamId) return [];
  try {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("team_id", teamId)
      .order("player_name");
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching players:", error);
    return [];
  }
}

// Fetch players for a team
export async function fetchPlayersForTeam(teamId: string): Promise<Player[]> {
  try {
    const { data, error } = await supabase.from("players").select("*").eq("team_id", teamId).order("player_name")

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error fetching players for team:", error)
    return []
  }
}

//Get all possession info for a certain player
export async function getPossessionsForPlayer(playerId: string) {
  // Step 1: Get all point_ids the player was involved in
  const { data: pointPlayerRows, error: pointError } = await supabase
    .from("point_players")
    .select("point_id")
    .eq("player_id", playerId);

  if (pointError) {
    console.error("Error fetching point-player links:", pointError);
    return [];
  }

  const pointIds = pointPlayerRows?.map((row) => row.point_id) ?? [];

  if (pointIds.length === 0) return [];

  // Step 2: Get possessions for those point_ids
  const { data: possessions, error: possessionsError } = await supabase
    .from("possessions")
    .select("*")
    .in("point_id", pointIds);

  if (possessionsError) {
    console.error("Error fetching possessions:", possessionsError);
    return [];
  }

  return possessions;
}

// fetch all points details
