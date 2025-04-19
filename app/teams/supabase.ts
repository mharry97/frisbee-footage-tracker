import { supabase } from "@/lib/supabase"
import type { Team } from "@/lib/supabase"

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
export async function fetchTeams(): Promise<Team[]> {
  const { data, error } = await supabase
    .from("teams")
    .select("*");
  if (error) throw error;
  return data ?? [];
}

// Get team name and is_home_team value for given team_id
export type BaseTeamInfo = Pick<Team, "team_id" | "team_name" | "is_home_team">;

export async function fetchBaseTeamInfo(id: string): Promise<BaseTeamInfo | null> {
  const { data, error } = await supabase
    .from("teams")
    .select("team_id, team_name, is_home_team")
    .eq("team_id", id)
    .single();

  if (error) throw error;
  return data ?? null;
}

// Get view for mapping team ids to name
export async function fetchTeamMapping(): Promise<BaseTeamInfo[]> {
  const { data, error } = await supabase
    .from("teams")
    .select("team_id, team_name, is_home_team")

  if (error) throw error;
  return data ?? null;
}

// Add new team to table
export async function insertTeam(teamName: string): Promise<Team> {
  const { data, error } = await supabase
    .from("teams")
    .insert([{ team_name: teamName }])
    .single();
  if (error) throw error;
  return data;
}
