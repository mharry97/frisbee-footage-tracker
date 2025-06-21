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

export type PointPlayer = {
  player_id: string
  point_id: string
}

// export type Activity = {
//   activity_id: string
//   created_at: string
//   title: string
//   timestamp: string
//   source_id: string
//   event_id?: string
// }

export type Player = {
  player_id: string
  player_name: string
  team_id: string
  is_admin: boolean
  is_active: boolean
  auth_user_id: string
}

export type Possession = {
  point_id: string
  offence_init: string | null
  defence_init: string | null
  offence_main: string | null
  defence_main: string | null
  throws: number
  turn_throw_zone: number | null
  turn_receive_zone: number | null
  turnover_reason: string | null
  score_method: string | null
  score_player: string | null
  assist_player: string | null
  offence_team: string
  defence_team: string
  turn_thrower: string | null
  turn_intended_receiver: string | null
  d_player: string | null
  possession_number: number
  is_score: boolean
}

export type Playlist = {
  playlist_id: string
  title: string
  description: string
  is_public: boolean
  created_by: string
  created_at: string
}

export type PlaylistClip = {
  playlist_id: string
  clip_id: string
}

// export type PrivatePlaylistClip = {
//   playlist_id: string
//   clip_id: string
//   user_id: string
// }

