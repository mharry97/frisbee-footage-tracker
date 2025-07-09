import {supabase} from "@/lib/supabase.ts";


export type SearchPlayer = {
  unique_player_id: string
  event_team_id: string
  event_name: string
  event_team_name: string
  event_player_name: string
  event_player_number: number
  games: number
  assists: number
  goals: number
  event_player_id: string
}

// READING

export async function fetchScrapedPlayers(): Promise<SearchPlayer[]> {
  const { data, error } = await supabase
    .from("scraped_players")
    .select("*")
    .order("event_team_id", {ascending: false})
    .order("event_team_name", {ascending: true})
    .order("event_player_number", {ascending: true})

  if (error) throw error;
  return data || []
}
