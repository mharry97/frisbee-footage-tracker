import { type Player, supabase } from "@/lib/supabase";
import { getHomeTeam } from "@/app/teams/supabase";



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

// Fetch players for a team
export async function fetchPlayersForTeam(teamId: string): Promise<Player[]> {
  try {
    const { data } = await supabase.from("players").select("*").eq("team_id", teamId).order("player_name")


    return data || []
  } catch (error) {
    console.error("Error fetching players for team:", error)
    return []
  }
}


// Get the number of points played by each player
export type PointsByPlayer = {
  point_id: string;
  player_id: string;
  player_name: string;
  event_name: string;
  event_id: string;
  event_date: string;
  timestamp: string;
  timestamp_url: string;
  point_offence_team: string;
  point_offence_team_name: string;
  point_defence_team: string;
  point_defence_team_name: string;
  outcome: string;
}

export async function getPlayerPointsPlayed(player_id: string):  Promise<PointsByPlayer[]> {
  const { error, data } = await supabase
    .from('point_players_exp')
    .select("*")
    .eq("player_id", player_id)

  if (error) throw error;
  return data ?? [];
}
