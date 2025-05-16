import {Clip, PointPlayer, supabase} from "@/lib/supabase"
import type { Playlist, PlaylistClip } from "@/lib/supabase"


// I think in terms of having the correct playlists showing up and updating properly across both public and private we need:
// Write every time someone clicks add log it to playlist_clips
// Then when populating, take the most recent log for each, destructure it and use

// Fetch all public playlists from Supabase
type PlaylistWithCreator = Omit<Playlist, 'creator'> & {
  creator: { player_name: string };
};
export async function fetchPlaylists(): Promise<PlaylistWithCreator[]> {
  try {
    const { data, error } = await supabase
      .from("playlists")
      .select(`
        *,
        creator:players (
          player_name
        )
      `)
      .order("title");

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    console.error("Error fetching playlists:", error);
    return [];
  }
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

export type NewPlaylist = Omit<Playlist, "playlist_id">;
export async function addPlaylist(playlist: NewPlaylist): Promise<NewPlaylist[]> {
  const { data, error } = await supabase
    .from("playlists")
    .insert([{
      title: playlist.title,
      description: playlist.description,
      is_public: playlist.is_public,
      creator: playlist.creator,
    }])
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





