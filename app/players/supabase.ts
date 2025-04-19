import { type Player, supabase } from "@/lib/supabase";
import { getHomeTeam } from "@/app/teams/supabase";


// Get the home team
const homeTeam = await getHomeTeam();

if (!homeTeam || !homeTeam) {
  throw new Error("Home team not found or missing team_id");
}

// Get home team players
export async function fetchHomePlayers(): Promise<Player[]> {
  try {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("team_id", homeTeam)
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
