import { supabase } from "@/lib/supabase";

// TYPES

export type Clip = {
  clip_id: string
  title: string
  description: string
  event_id: string | null
  is_public: boolean
  source_id: string
  timestamp: string
  created_at: string
  created_by: string
  playlists: string[] | null
  teams: string[] | null
  players: string[] | null
}

export type ClipDetail = Clip & {
  created_by_name: string
  event_name: string
  source_title: string
  url: string
}

export type UpsertClip = {
  clip_id?: string
  title: string
  description: string
  event_id?: string | null
  is_public: boolean
  source_id: string
  timestamp: string
  playlists?: string[] | []
  teams?: string[] | []
  players?: string[] | []
}

// READING

// Fetch visible clips for given column
interface ClipFilters {
  eventId?: string;
  teamId?: string;
  requestPlayer: string;
  clipPlayer?: string;
  playlist?: string;
}

export async function fetchClipsCustom(filters: ClipFilters) {
  let query = supabase
    .from("view_clip_detail")
    .select("*")
    .or(`is_public.eq.true, created_by.eq.${filters.requestPlayer}`)
    .order("created_at", { ascending: true });

  if (filters.eventId) {
    query = query.eq("event_id", filters.eventId);
  }
  if (filters.clipPlayer) {
    query = query.contains("players", `["${filters.clipPlayer}"]`)
  }
  if (filters.teamId) {
    query = query.contains("teams", `["${filters.teamId}"]`);
  }
  if (filters.playlist) {
    query = query.contains("playlists", `["${filters.playlist}"]`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching clips:", error);
    throw error;
  }

  return data || [];
}

// WRITING

// Updates/adds a clip
export async function upsertClip(payload: UpsertClip): Promise<void> {
  const { error } = await supabase
    .from("clips")
    .upsert(payload)

  if (error) throw error
}



