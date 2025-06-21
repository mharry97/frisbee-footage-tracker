import { supabase } from "@/lib/supabase";

// TYPES

export type Clip = {
  clip_id: string
  title: string
  description: string
  event_id: string | null
  is_public: boolean
  base_url: string
  timestamp: string
  timestamp_seconds: number
  created_at: string
}

type NewClip = Omit<Clip, "clip_id"| "created_at" >

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

// WRITING

// Add a new clip
export async function addClip(data: NewClip): Promise<void> {
  const { error } = await supabase
    .from("clips")
    .insert(data)

  if (error) throw error;
}


// Updates a clip
export async function upsertClip(payload: NewClip): Promise<Clip> {
  const { data, error } = await supabase
    .from("clips")
    .upsert(payload)
    .single()

  if (error) throw error
  return data || []
}

// Fetch most recent info for all events from Supabase for a given event_id
export async function fetchEventClips(event_id: string): Promise<Clip[]> {
  try {
    const { data } = await supabase
      .from("clips")
      .select('*')
      .eq("is_public", true)
      .eq("event_id", event_id)
      .order("title");

    return (data || []);
  } catch (error) {
    console.error("Error fetching clips:", error);
    return [];
  }
}

// Fetches all playlist clips
export async function fetchPlaylistClips(
  playlistId: string,
  limit?: number,
): Promise<Clip[]> {
  const q = supabase
    .from("playlist_clips")
    .select(`clips:clip_id ( * )`)
    .eq("playlist_id", playlistId)
    .order("created_at", {
      ascending: false,
      foreignTable: "clips",
    });

  if (limit) q.limit(limit);

  const { data, error } = await q;
  if (error) throw error;

  return (data ?? []).flatMap((row) => row.clips as Clip[]);
}

