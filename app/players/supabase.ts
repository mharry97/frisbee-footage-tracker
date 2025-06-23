import {supabase} from "@/lib/supabase.ts";

export type Player = {
  player_id: string;
  player_name: string;
  is_active: string;
  is_admin: string;
  is_editor: string;
  notes: string;
  username: string;
  number: number;
}

export type PlayerDetailed = Player & {
  team_id: string;
  team_name: string;
  is_home_team: string;
  auth_user_id: string;
}

// Reading

export async function getPlayersForTeam(team_id: string): Promise<PlayerDetailed[]> {
  const { data, error } = await supabase
    .from("view_player_detail")
    .select("*")
    .eq("team_id", team_id)
    .order("team_name", {ascending: true})
    .order("player_name", {ascending: true})

  if (error) throw error;
  return data || []
}

// Fetch all players
export async function fetchPlayers(): Promise<PlayerDetailed[]> {
  const { data, error } = await supabase
    .from("view_player_detail")
    .select("*")
    .order("team_name", {ascending: true})
    .order("player_name", {ascending: true})

  if (error) throw error;
  return data || []
}
