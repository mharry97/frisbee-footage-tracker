import { supabase } from "@/lib/supabase"
import type { Point, Possession } from "@/lib/supabase"

// Fetch point info
export async function fetchPointById(pointId: string): Promise<Point[]> {
  try {
    const { data, error } = await supabase.from("points").select("*").eq("point_id", pointId)

    if (error) throw error
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
    const { data, error } = await supabase
      .from("possessions")
      .select("play:defence_init, count:count()")
      .neq('defence_init', '')
      .order("defence_init");

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error fetching plays:", error)
    return []
  }
}

export async function fetchOInitPlays(): Promise<Play[]> {
  try {
    const { data, error } = await supabase
      .from("possessions")
      .select("play:offence_init, count:count()")
      .neq('offence_init', '')
      .order("offence_init");

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error fetching plays:", error)
    return []
  }
}

export async function fetchDMainPlays(): Promise<Play[]> {
  try {
    const { data, error } = await supabase
      .from("possessions")
      .select("play:defence_main, count:count()")
      .neq('defence_main', '')
      .order("defence_main");

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error fetching plays:", error)
    return []
  }
}

export async function fetchOMainPlays(): Promise<Play[]> {
  try {
    const { data, error } = await supabase
      .from("possessions")
      .select("play:offence_main, count:count()")
      .neq('offence_main', '')
      .order("offence_main");

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error fetching plays:", error)
    return []
  }
}

// Write possession to Supabase
export async function writePossession(possessionData: Possession): Promise<Point[]> {
  try {
    // Insert and return the newly created row(s)
    const { data: insertedData, error } = await supabase
      .from("possessions")
      .insert(possessionData)
      .select();

    if (error || !insertedData) {
      throw error;
    }
    return insertedData;
  } catch (error) {
    console.error("Error writing point:", error);
    throw error;
  }
}

// Upsert player names
export async function upsertPlayer(player_name: string, team_id: string, player_id: string) {
  const { error } = await supabase
    .from("players")
    .upsert([{ player_name, team_id, player_id }], {
      onConflict: "team_id, player_name",
    });

  if (error) {
    throw new Error("Error upserting player: " + error.message);
  }
}

// Fetch number of possessions for a given point
export async function fetchPossessionsForPoint(point_id: string) {
  const { data, error } = await supabase
    .from("possessions")
    .select("*")
    .eq("point_id", point_id);

  if (error) throw error;
  return data;
}
