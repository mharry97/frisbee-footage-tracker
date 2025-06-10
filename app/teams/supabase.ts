import { supabase } from "@/lib/supabase"

export type Team = {
  team_id: string
  team_name: string
  created_at: string
  is_home_team: boolean
}

export type TeamDetailed = Team & {
  players: number
}

type InsertTeam = {
  team_name: string
}

// READING

// Fetch home team
export async function getHomeTeam(): Promise<string | null> {
  const { data, error } = await supabase
    .from("teams")
    .select("team_id")
    .eq("is_home_team", true)
    .single();

  if (error) {
    console.error("Error fetching home team:", error);
    throw new Error("Failed to fetch home team");
  }
  return data ? data.team_id : null;
}

// Fetch all teams
export async function fetchTeams(): Promise<TeamDetailed[]> {
  const { data, error } = await supabase
    .from("view_team_detail")
    .select("*")
    .order("team_name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// Fetch teams for event
export async function fetchEventTeams(event_id: string): Promise<TeamDetailed[]> {
  const { data, error } = await supabase
    .from("view_team_detail")
    .select("*")
    .eq("event_id", event_id)
    .order("team_name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// Get specific team info fetchBaseTeamInfo BaseTeamInfo
export async function fetchTeam(id: string): Promise<TeamDetailed> {
  const { data, error } = await supabase
    .from("view_team_detailed")
    .select("*")
    .eq("team_id", id)
    .single();

  if (error) throw error;
  return data ?? null;
}

// Get view for mapping team ids to name
export async function fetchTeamMapping(): Promise<TeamDetailed[]> {
  const { data, error } = await supabase
    .from("teams")
    .select("*")

  if (error) throw error;
  return data ?? [];
}

// WRITING

// Insert new team
export async function addTeam(data: InsertTeam): Promise<void> {
  const { error } = await supabase
    .from("teams")
    .insert(data);

  if (error) throw error;
}

// Update team
export async function updateTeam({ team_name, team_id }: Team): Promise<void> {
  const { error } = await supabase
    .from("teams")
    .upsert(team_name)
    .eq("team_id", team_id)

  if (error) throw error
}

// Add new team to table
export async function upsertTeam(teamName: string): Promise<Team> {
  const { data, error } = await supabase
    .from('teams')
    .upsert(teamName)
    .select('team_id, team_name')
    .select("*").single()

  if (error) throw error
  if (!data) throw new Error('Upsert did not return a row')
  return data
}
