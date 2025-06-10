import { supabase } from '@/lib/supabase'
import { Player } from "@/app/players/supabase"

type CollectionPlayerDetailed = Omit<Player, "notes"|"is_admin"|"is_editor"|"username"> & {
  team_id: string,
  team_name: string,
}

type TeamWithPlayers = {
  team_id: string;
  team_name: string;
  players: CollectionPlayerDetailed[];
}

// READING
export type TeamBasic = {
  team_name: string,
  team_id: string
}
export async function fetchEventTeamsInfo(teams: string[]): Promise<TeamBasic[]> {
  const { data, error } = await supabase
    .from("view_team_detail")
    .select("team_id, team_name")
    .in("team_id", teams)

  if (error) throw error
  return data ?? [];
}

// Get all players for a specific event
export async function fetchEventTeams(event_id: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("view_event_detail")
    .select("teams")
    .eq("event_id", event_id)
    .single();
  if (error) {
    console.error("Error fetching event teams:", error.message);
    return [];
  }
  return data?.teams || [];
}

export async function fetchEventPlayers(teams: string[]): Promise<TeamWithPlayers[]> {
  if (!teams || teams.length === 0) {
    return [];
  }

  const { data: players, error } = await supabase
    .from("view_player_detail")
    .select("player_id, player_name, team_id, team_name, number, is_active")
    .in("team_id", teams)
    .order("player_name", {ascending: true})
    .order("is_active", {ascending: true});

  if (error) {
    console.error("Error fetching players for teams:", error);
    throw error;
  }

  if (!players) {
    return [];
  }

  const groupedByTeam = new Map<string, TeamWithPlayers>();

  for (const player of players) {
    // Skip any player records that might be missing data
    if (!player.team_id || !player.team_name) continue;

    if (!groupedByTeam.has(player.team_id)) {
      groupedByTeam.set(player.team_id, {
        team_id: player.team_id,
        team_name: player.team_name,
        players: [],
      });
    }
    groupedByTeam.get(player.team_id)!.players.push(player);
  }
  return Array.from(groupedByTeam.values());
}


