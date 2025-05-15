import { supabase, Clip } from "@/lib/supabase";

// Inserts or updates a clip in the Supabase `clips` table.
export type NewClip = Omit<Clip, "clip_id">;
export async function upsertClip(input: NewClip): Promise<Clip> {
  const { data, error } = await supabase
    .from("clips")
    .upsert(
      input,
      { onConflict: "clip_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return data ?? [];
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

  return (data ?? []).map((row) => row.clips as Clip);
}

