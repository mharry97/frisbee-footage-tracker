import { supabase} from "@/lib/supabase"
import type { Playlist, PlaylistClip } from "@/lib/supabase"


export type AddPlaylist = Omit<Playlist, "created_at" | "created_by" | "playlist_id">

// Fetch all public playlists from Supabase
export type PlaylistWithCreator = Omit<Playlist, 'creator'> & {
  creator: { player_name: string };
};
export async function fetchPlaylists(): Promise<PlaylistWithCreator[]> {
    const { data, error } = await supabase
      .from("playlists")
      .select("*")
      .order("created_at");

    if (error) throw error;
    return data ?? [];
}

export async function fetchPlaylist(id: string): Promise<Playlist | null> {
  const { data, error } = await supabase
    .from("playlists")
    .select("*")
    .eq("playlist_id", id)
    .single();

  if (error) throw error;
  return data;
}


export async function addPlaylist(playlist: AddPlaylist): Promise<Playlist[]> {
  const { data, error } = await supabase
    .from("playlists")
    .insert(playlist)
    .select();

  if (error) throw error;
  return data ?? [];
}

// Fetch all user playlists from Supabase
// export async function fetchUserPlaylists(): Promise<Playlist[]> {
//   try {
//     const { data, error } = await supabase
//       .from("playlists")
//       .select("*")
//       // Need to add filter for creator - user_id from local storage when set up
//       .order("title");
//
//
//     if (error) throw error;
//
//     return data ?? []
//   } catch (error) {
//     console.error("Error fetching user playlists:", error);
//     return [];
//   }
// }

// Write playlist slips to playlist_clips
export async function upsertPlaylistClip(
  items: PlaylistClip | PlaylistClip[],
): Promise<void> {
  const payload = Array.isArray(items) ? items : [items];

  const { error } = await supabase
    .from("playlist_clips")
    .upsert(payload, { onConflict: "playlist_id, clip_id" });

  if (error) throw error;
}





