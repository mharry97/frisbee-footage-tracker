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

export type NewClip = Omit<Clip, "clip_id"| "created_at" | "created_by" >

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

// Fetch all clips
export async function fetchClips(): Promise<Clip[]> {
  const { data, error } = await supabase
    .from("clips")
    .select("*")
    .order("created_at", {ascending: false});

  if (error) throw error;
  return data || []
}

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
    .order("created_at", { ascending: false });

  if (filters.eventId) {
    query = query.eq("event_id", filters.eventId);
  }
  if (filters.clipPlayer) {
    query = query.contains("players", `["${filters.clipPlayer}"]`)
  }
  if (filters.teamId) {
    query = query.containedBy("teams", JSON.stringify([filters.teamId]));
  }
  if (filters.playlist) {
    query = query.containedBy("playlists", JSON.stringify([filters.playlist]));
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching clips:", error);
    throw error;
  }

  return data || [];
}

// WRITING

// Add a new clip
export async function addClip(data: NewClip): Promise<void> {
  const { error } = await supabase
    .from("clips")
    .insert(data)

  if (error) throw error;
}


// Updates/adds a clip
export async function upsertClip(payload: UpsertClip): Promise<void> {
  const { error } = await supabase
    .from("clips")
    .upsert(payload)

  if (error) throw error
}

// Fetch all clips visible to a player for a given event_id
export async function fetchEventClips(event_id: string, player_id: string): Promise<ClipDetail[]> {
  try {
    const { data } = await supabase
      .from("view_clip_detail")
      .select('*')
      .or(`is_public.eq.true, created_by.eq.${player_id}`)
      .eq("event_id", event_id)
      .order("created_at", {ascending: false});

    return (data || []);
  } catch (error) {
    console.error("Error fetching clips:", error);
    return [];
  }
}

// Fetch all clips visible to a player for a given playlist_id
export async function fetchPlaylistClips(playlist_id: string, player_id: string): Promise<ClipDetail[]> {
  try {
    const { data } = await supabase
      .from("view_clip_detail")
      .select('*')
      .or(`is_public.eq.true, created_by.eq.${player_id}`)
      .containedBy("playlists", playlist_id)
      .order("created_at", {ascending: false});

    return (data || []);
  } catch (error) {
    console.error("Error fetching clips:", error);
    return [];
  }
}

