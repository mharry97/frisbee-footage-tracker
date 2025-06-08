import {Possession, supabase} from "@/lib/supabase";

export type PossessionDetailed = {
  possession_id: string
  point_id: string
  event_id: string
  event_name: string
  offence_init: string | null
  defence_init: string | null
  offence_main: string | null
  defence_main: string | null
  throws: number | null
  turn_throw_zone: number | null
  turn_receive_zone: number | null
  turnover_reason: string | null
  score_method: string | null
  offence_team: string | null
  offence_team_name: string | null
  defence_team: string | null
  defence_team_name: string | null
  possession_number: number | null
  is_score: boolean
  timestamp_url: string | null
  point_offence_team: string | null
  point_offence_team_name: string | null
  point_defence_team: string | null
  point_defence_team_name: string | null
  score_player: string | null
  score_player_name: string | null
  assist_player: string | null
  assist_player_name: string | null
  turn_thrower: string | null
  turn_thrower_name: string | null
  turn_intended_receiver: string | null
  turn_intended_receiver_name: string | null
  d_player: string | null
  d_player_name: string | null
  timestamp: string | null
  event_date: string | null
}

// Fetch basic info for all possessions from Supabase for a given event_id
export async function fetchEventPossessions(event_id: string): Promise<Possession[]> {
  try {
    const { data, error } = await supabase
      .from("possessions")
      .select("*, points!inner()")
      .eq("points.event_id", event_id);

    if (error) throw error;

    return data?? [];
  } catch (error) {
    console.error("Error fetching possession info:", error);
    return [];
  }
}

// Fetch all possessions specific point
export async function fetchPointPossessions(point_id: string): Promise<PossessionDetailed[]> {
  const { data, error } = await supabase
    .from("view_possession_detail")
    .select("*")
    .eq("point_id", point_id)
    .order("possession_number", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

//Fetch all possessions
export async function fetchAllPossessions(): Promise<PossessionDetailed[]> {
  const { data, error } = await supabase
    .from("view_possession_detail")
    .select("*")
    .order("event_date", { ascending: false })
    .order("timestamp_seconds", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function deletePossession(point_id: string, possession_number: number): Promise<void> {
  const { error } = await supabase
    .from("possessions")
    .delete()
    .match({ point_id, possession_number });

  if (error) {
    console.error("Failed to delete possession:", error);
    throw error;
  }
}

export async function updatePossession(point_id: string, possession_number: number, data: Partial<PossessionDetailed>) {
  const { error } = await supabase
    .from("possessions")
    .update(data)
    .match({ point_id, possession_number });

  if (error) {
    throw new Error(`Failed to update possession: ${error.message}`);
  }
}
