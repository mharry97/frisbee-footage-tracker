import { supabase } from "@/lib/supabase"
import {PlayerDetailed} from "@/app/players/supabase.ts";

export async function getHomeTeamPlayerInfo(team_id: string): Promise<PlayerDetailed[]> {
  const { data, error } = await supabase
    .from("view_player_detail")
    .select("*")
    .eq("team_id", team_id)
    .order("player_name", { ascending: true})

  if (error) throw error;
  return data || [];
}
