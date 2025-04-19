import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY


if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables. Please check your .env file or environment configuration.")
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Type definitions for database tables
export type Source = {
  id: string
  created_at: string
  title: string
  url: string
  recorded_date: string
}

export type Event = {
  event_id: string
  event_name: string
  event_date: string
  type: "Game" | "Training" | "Scrimmage"
  team_1?: string
  team_2?: string
  team_1_id: string
  team_2_id: string
}

export type Point = {
  point_id: string
  event_id: string
  timestamp: string
  offence_team: string
  defence_team: string
  is_break: boolean
  source_id: string
  created_at: string
  base_url: string
  timestamp_url: string
}

export type PointPlayer = {
  player_id: string
  point_id: string
}

export type Team = {
  team_id: string
  team_name: string
  created_at: string
  is_home_team: boolean
}


export type Activity = {
  activity_id: string
  created_at: string
  title: string
  timestamp: string
  source_id: string
  event_id?: string
}

export type Player = {
  player_id: string
  player_name: string
  team_id: string
  username: string
  password_hash: string
  is_active: boolean
  is_admin: boolean
}

export type Possession = {
  point_id: string,
  offence_init: string,
  offence_init_successful: boolean | null,
  defence_init: string,
  defence_init_successful: boolean | null,
  offence_main: string,
  defence_main: string,
  throws: number,
  turn_throw_zone: number,
  turn_receive_zone: number,
  turnover_reason: string,
  score_method: string,
  score_player: string | null,
  assist_player: string | null,
  offence_team: string,
  defence_team: string,
  turn_thrower: string | null,
  turn_intended_receiver: string | null,
  d_player: string | null,
  possession_number: number,
  is_score: boolean
}
