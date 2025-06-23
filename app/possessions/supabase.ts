import {Possession, supabase} from "@/lib/supabase";
import {PlayerDetailed} from "@/app/players/supabase.ts";

export type PossessionDetailed = {
  possession_id: string
  point_id: string
  event_id: string
  event_name: string
  offence_init: string | null
  defence_init: string | null
  offence_main: string | null
  defence_main: string | null
  offence_init_name: string | null
  defence_init_name: string | null
  offence_main_name: string | null
  defence_main_name: string | null
  throws: number | null
  turn_throw_zone: number | null
  turn_receive_zone: number | null
  turnover_reason: string | null
  score_method: string | null
  offence_team: string
  offence_team_name: string
  defence_team: string
  defence_team_name: string
  possession_number: number
  is_score: boolean
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
  timestamp: string
  base_url: string
  event_date: string
}

export type NewPossession = Omit<Possession, 'possession_id'>



// Fetch basic info for all possessions from Supabase for a given event_id
export async function fetchEventPossessions(event_id: string): Promise<PossessionDetailed[]> {
  const { data, error } = await supabase
    .from("view_possession_detail")
    .select("*")
    .eq("event_id", event_id);

  if (error) throw error;

  return data?? [];
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

// Fetch all possessions
export async function fetchAllPossessions(): Promise<PlayerDetailed[]> {
  const { data, error } = await supabase
    .from("view_possession_detail")
    .select("*")
    .order("event_date", { ascending: false })
    .order("timestamp_seconds", { ascending: false });

  if (error) throw error;
  return data || []
}

//Fetch all possessions
interface PossessionFilters {
  offenceTeamId?: string;
  defenceTeamId?: string;
  outcome?: 'Score' | 'Turnover';
  playerId?: string;
  defenceInit?: string;
  defenceMain?: string;
  offenceInit?: string;
  offenceMain?: string;
  possessionNumber?: number;
}
export async function fetchFilteredPossessions(filters: PossessionFilters = {}): Promise<PossessionDetailed[]> {
  let query = supabase
    .from("view_possession_detail")
    .select("*")
    .order("event_date", { ascending: false })
    .order("timestamp_seconds", { ascending: false });

  // All applied filters
  if (filters.offenceTeamId && filters.offenceTeamId.length > 0) {
    query = query.eq('offence_team', filters.offenceTeamId[0]);
  }

  if (filters.defenceTeamId && filters.defenceTeamId.length > 0) {
    query = query.eq('defence_team', filters.defenceTeamId[0]);
  }

  if (filters.outcome && filters.outcome.length > 0) {
    const isScore = filters.outcome[0] === 'Score';
    query = query.eq('is_score', isScore);
  }

  if (filters.playerId && filters.playerId.length > 0) {
    const offenceFilter = `offence_team_players.cs.{${filters.playerId[0]}}`;
    const defenceFilter = `defence_team_players.cs.{${filters.playerId[0]}}`;
    query = query.or(`${offenceFilter},${defenceFilter}`);
  }

  if (filters.defenceInit && filters.defenceInit.length > 0) {
    query = query.eq('defence_init', filters.defenceInit[0]);
  }

  if (filters.defenceMain && filters.defenceMain.length > 0) {
    query = query.eq('defence_main', filters.defenceMain[0]);
  }

  if (filters.offenceInit && filters.offenceInit.length > 0) {
    query = query.eq('offence_init', filters.offenceInit[0]);
  }

  if (filters.offenceMain && filters.offenceMain.length > 0) {
    query = query.eq('offence_main', filters.offenceMain[0]);
  }

  if (filters.possessionNumber) {
    query = query.eq('possession_number', filters.possessionNumber);
  }

  const { data, error } = await query;

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

// WRITING

// Write possession to Supabase
export async function addPossession(possessionData: NewPossession): Promise<void> {
    const { error } = await supabase
      .from("possessions")
      .insert(possessionData)

    if (error) throw error;
}


