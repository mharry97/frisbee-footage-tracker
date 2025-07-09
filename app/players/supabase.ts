import {supabase} from "@/lib/supabase.ts";

export type Player = {
  player_id: string;
  player_name: string;
  is_active: boolean;
  is_admin: boolean;
  is_editor: boolean;
  notes: string;
  number: number;
  team_id: string;
}

export type PlayerDetailed = Player & {
  team_name: string;
  is_home_team: string;
  auth_user_id: string;
  username: string;
}

export type UpsertPlayer = {
  player_id?: string | null;
  team_id: string;
  number?: number| null;
  notes?: string | null;
  player_name: string;
  is_active?: boolean;
};

export type TeamPlayer = {
  player_id: string;
  team_id: string;
  player_name: string;
}

// Reading

export async function getPlayersForTeam(team_id: string): Promise<PlayerDetailed[]> {
  const { data, error } = await supabase
    .from("view_player_detail")
    .select("*")
    .eq("team_id", team_id)
    .order("is_active", {ascending: false})
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

// Fetch specific player details
export async function fetchPlayer(playerId: string): Promise<PlayerDetailed | null> {
  const { data, error } = await supabase
    .from("view_player_detail")
    .select("*")
    .eq("player_id", playerId)
    .single()

  if (error) throw error;
  return data || null
}


// Writing

// Upsert player
export async function upsertPlayer(data: UpsertPlayer): Promise<void> {
  const { error } = await supabase
    .from("players")
    .upsert(data)

  if (error) throw error;
}

// Get view for mapping team ids to name
export async function fetchTeamMapping(): Promise<TeamPlayer[]> {
  const { data, error } = await supabase
    .from("players")
    .select("player_id, team_id, player_name")

  if (error) throw error;
  return data ?? [];
}
