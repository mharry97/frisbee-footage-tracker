import { supabase } from '@/lib/supabase'

// READING
export type TeamBasic = {
  team_name: string,
  team_id: string
}
export async function fetchEventTeamsInfo(teams: string[]): Promise<TeamBasic[]> {
  const { data, error } = await supabase
    .from("view_team_detail")
    .select("team_id, team_name")
    .in("team_id", teams)

  if (error) throw error
  return data ?? [];
}

// Get all players for a specific event
export async function fetchEventTeams(event_id: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("view_event_detail")
    .select("teams")
    .eq("event_id", event_id)
    .single();
  if (error) {
    console.error("Error fetching event teams:", error.message);
    return [];
  }
  return data?.teams || [];
}



