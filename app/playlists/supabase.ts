import { supabase} from "@/lib/supabase"
import type { Playlist, PlaylistClip } from "@/lib/supabase"

export type PlaylistDetailed = {
  playlist_id: string
  created_at: string
  created_by: string
  created_by_name: string
  title: string
  description: string
  is_public: boolean
  clips: string[]
}


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

export async function fetchVisiblePlaylists(playerId: string): Promise<PlaylistDetailed[]> {
  const { data, error } = await supabase
    .from("view_playlist_detail")
    .select("*")
    .or(`is_public.eq.true, created_by.eq.${playerId}`)
    .order("created_at", {ascending: false});

  if (error) throw error;
  return data ?? [];
}

export async function fetchPlaylist(id: string): Promise<PlaylistDetailed | null> {
  const { data, error } = await supabase
    .from("view_playlist_detail")
    .select("*")
    .eq("playlist_id", id)
    .single();

  if (error) throw error;
  return data;
}


export async function addPlaylist(playlist: AddPlaylist): Promise<void> {
  const { error } = await supabase
    .from("playlists")
    .insert(playlist)

  if (error) throw error;
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





