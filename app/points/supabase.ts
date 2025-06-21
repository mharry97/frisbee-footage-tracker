import { supabase } from "@/lib/supabase";

export type PointDetailed = {
  point_id: string
  event_id: string
  event_name: string
  event_date: string
  source_id: string
  title: string
  timestamp: string
  timestamp_seconds: number
  offence_team: string
  offence_team_name: string
  defence_team: string
  defence_team_name: string
  point_outcome: string
  base_url: string
  possession_number: number
  offence_team_players: string[]
  defence_team_players: string[]
  assist_player: string
  score_player: string
  assist_player_name: string
  score_player_name: string
  possessions_statted: number
}

export type Point = {
  point_id: string
  event_id: string
  timestamp: string
  offence_team: string
  defence_team: string
  source_id: string
  created_at: string
  offence_team_players: string[]
  defence_team_players: string[]
}

export type PointPlayers = {
  point_id: string
  offence_team_players: string[]
  defence_team_players: string[]
}

type AddPoint = Omit<Point, "point_id"|"created_at"|"offence_team_players"|"defence_team_players">;

// READING

// Fetch all points
export async function fetchAllPoints(): Promise<PointDetailed[]> {
    const { data, error } = await supabase
      .from("view_point_detail")
      .select("*")
      .order("event_date", { ascending: false })
      .order("timestamp_seconds", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// Fetch specific point info
export async function fetchPoint(point:string): Promise<PointDetailed> {
  const { data, error } = await supabase
    .from("view_point_detail")
    .select("*")
    .eq("point_id", point)
    .single()

  if (error) throw error;
  return data;
}

//Fetch all points for event
export async function fetchEventPoints(event_id: string): Promise<PointDetailed[]> {
  const { data, error } = await supabase
    .from("view_point_detail")
    .select("*")
    .eq("event_id", event_id)
    .order("event_date", { ascending: false })
    .order("timestamp_seconds", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

type PlayerPoint = PointDetailed & { player_id: string }
//Fetch all points for player
export async function fetchPlayerPoints(player_id: string): Promise<PlayerPoint[]> {
  const { data, error } = await supabase
    .from("view_points_by_player")
    .select("*")
    .eq("player_id", player_id)
    .order("event_date", { ascending: false })
    .order("timestamp_seconds", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

//WRITING

// Insert new point
export async function addPoint(input: AddPoint): Promise<string> {
  const { data, error } = await supabase
    .from("points")
    .insert(input)
    .select("point_id")
    .single()

  if (error) throw error;
  return data.point_id || ""
}

// Update point
export async function editPoint(data: Point): Promise<void> {
  const { error } = await supabase
    .from("points")
    .upsert(data)
    .eq("event_id", data.event_id);

  if (error) throw error;
}

//Update players in a point
export async function updatePointPlayers(data: PointPlayers): Promise<void> {
  const { error } = await supabase
    .from("points")
    .update({
      offence_team_players: data.offence_team_players,
      defence_team_players: data.defence_team_players
    })
    .eq("point_id", data.point_id)

  if (error) throw error;
}


