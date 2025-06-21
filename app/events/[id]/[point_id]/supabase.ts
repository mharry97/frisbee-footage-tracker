import { supabase } from "@/lib/supabase"
import { PointDetailed } from "@/app/points/supabase"

// Fetch point info
export async function fetchPointById(pointId: string): Promise<PointDetailed[]> {
  try {
    const { data } = await supabase.from("view_point_detail").select("*").eq("point_id", pointId)

    console.log(pointId)
    return data || []
  } catch (error) {
    console.error("Error fetching point info:", error)
    return []
  }
}

// Get unique plays
export type Play = {
  play: string
  count: number
}

export async function fetchDInitPlays(): Promise<Play[]> {
  try {
    const { data } = await supabase
      .from("possessions")
      .select("play:defence_init, count:count()")
      .neq('defence_init', '')
      .order("defence_init");


    return data || []
  } catch (error) {
    console.error("Error fetching plays:", error)
    return []
  }
}

export async function fetchOInitPlays(): Promise<Play[]> {
  try {
    const { data } = await supabase
      .from("possessions")
      .select("play:offence_init, count:count()")
      .neq('offence_init', '')
      .order("offence_init");


    return data || []
  } catch (error) {
    console.error("Error fetching plays:", error)
    return []
  }
}

export async function fetchDMainPlays(): Promise<Play[]> {
  try {
    const { data } = await supabase
      .from("possessions")
      .select("play:defence_main, count:count()")
      .neq('defence_main', '')
      .order("defence_main");

    return data || []
  } catch (error) {
    console.error("Error fetching plays:", error)
    return []
  }
}

export async function fetchOMainPlays(): Promise<Play[]> {
  try {
    const { data } = await supabase
      .from("possessions")
      .select("play:offence_main, count:count()")
      .neq('offence_main', '')
      .order("offence_main");

    return data || []
  } catch (error) {
    console.error("Error fetching plays:", error)
    return []
  }
}


// Upsert player names
export async function upsertPlayer(player_name: string, team_id: string, player_id: string) {
  const { error, data } = await supabase
    .from("players")
    .upsert([{ player_name, team_id, player_id }], {
      onConflict: "team_id, player_name",
    });

  return { error, data };
}


// Fetch number of possessions for a given point
export async function fetchPossessionsForPoint(point_id: string) {
  const { data } = await supabase
    .from("possessions")
    .select("*")
    .eq("point_id", point_id);

  return data;
}
