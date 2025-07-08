import { supabase} from "@/lib/supabase"
import type { Playlist } from "@/lib/supabase"

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




