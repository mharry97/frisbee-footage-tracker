import { supabase } from "@/lib/supabase"
import {TeamPlayer} from "@/app/teams/[team_id]/[player_id]/supabase.ts";

export async function getHomeTeamPlayerInfo(team_id: string): Promise<TeamPlayer[]> {
  const { data, error } = await supabase
    .from("view_player_info")
    .select("*")
    .eq("team_id", team_id)
    .order("player_name", { ascending: true})

  if (error) throw error;
  return data || [];
}
