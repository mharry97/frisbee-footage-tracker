import { supabase } from "@/lib/supabase"
import type { Source, Team, Player, Point, PointPlayer } from "@/lib/supabase"


export type NewPoint = Pick<Point, "event_id" | "source_id" | "timestamp" | "offence_team" | "defence_team">;

// Write point to Supabase
export async function writePoint(pointData: NewPoint): Promise<Point[]> {
  try {
    // Insert and return the newly created row(s)
    const { data: insertedData, error } = await supabase
      .from("points")
      .insert(pointData)
      .select(); // returns newly created row(s)

    if (error || !insertedData) {
      throw error;
    }
    return insertedData;
  } catch (error) {
    console.error("Error writing point:", error);
    throw error;
  }
}

// Write points players
export async function writePointPlayers(pointPlayersData: {
  point_id: string;
  player_id: string
}[]): Promise<PointPlayer[]> {
  try {
    // Insert and return the newly created row(s)
    const { data: insertedData, error } = await supabase
      .from("point_players")
      .insert(pointPlayersData)
      .select();

    if (error || !insertedData) {
      throw error;
    }
    return insertedData;
  } catch (error) {
    console.error("Error writing point players:", error);
    throw error;
  }
}




// Fetch sources for dropdown
export async function fetchSources(): Promise<Source[]> {
  try {
    const { data, error } = await supabase
      .from("sources")
      .select("id, title, url, created_at, recorded_date")
      .order("recorded_date", { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error fetching sources:", error)
    return []
  }
}

// Fetch teams for an event
export async function fetchTeamsForEvent(eventId: string): Promise<Team[]> {
  try {
    // First, get the event to find team_1 and team_2
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("team_1_id, team_2_id")
      .eq("event_id", eventId)
      .single()

    if (eventError) {
      console.error("Error fetching event:", eventError)
      return []
    }

    if (!event || (!event.team_1_id && !event.team_2_id)) {
      console.log("No teams found for event")
      return []
    }

    // Create an array of team IDs to fetch, filtering out null/undefined values
    const teamIds = [event.team_1_id, event.team_2_id].filter((id) => id)

    // Fetch the teams
    const { data: teams, error: teamsError } = await supabase.from("teams").select("*").in("team_id", teamIds)

    if (teamsError) {
      console.error("Error fetching teams:", teamsError)
      return []
    }

    console.log("Fetched teams:", teams)
    return teams || []
  } catch (error) {
    console.error("Error in fetchTeamsForEvent:", error)
    return []
  }
}


// Fetch players for multiple teams
export async function fetchPlayersForTeams(teamIds: string[]): Promise<Player[]> {
  try {
    if (!teamIds.length) return []

    const { data, error } = await supabase.from("players").select("*").in("team_id", teamIds).order("player_name")

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error fetching players for teams:", error)
    return []
  }
}

// Save a new point with possessions
export async function savePoint(pointData: any) {
  try {
    // Start a transaction
    // Note: Supabase JS client doesn't support transactions directly
    // We'll use sequential operations and handle errors

    // 1. Insert the point
    const { data: point, error: pointError } = await supabase
      .from("points")
      .insert([
        {
          event_id: pointData.eventId,
          source_id: pointData.sourceId,
          base_url: pointData.baseUrl,
          timestamp: pointData.timestamp,
          timestamp_url: calculateTimestampUrl(pointData.baseUrl, pointData.timestamp),
          offence_team: pointData.offenceTeam,
          defence_team: pointData.defenceTeam,
          is_break: pointData.isBreak,
        },
      ])
      .select()
      .single()

    if (pointError) throw pointError

    const pointId = point.point_id

    // 2. Insert point_players if any
    if (pointData.players && pointData.players.length > 0) {
      const playerInserts = pointData.players
        .filter((playerId: string) => playerId) // Filter out empty values
        .map((playerId: string) => ({
          point_id: pointId,
          player_id: playerId,
        }))

      if (playerInserts.length > 0) {
        const { error: playersError } = await supabase.from("point_players").insert(playerInserts)

        if (playersError) throw playersError
      }
    }

    // 3. Insert possessions
    for (let i = 0; i < pointData.possessions.length; i++) {
      const possession = pointData.possessions[i]
      const possessionNumber = i + 1

      // Determine which team is on offence for this possession
      const possessionOffenceTeam = i % 2 === 0 ? pointData.offenceTeam : pointData.defenceTeam

      const possessionDefenceTeam = i % 2 === 0 ? pointData.defenceTeam : pointData.offenceTeam

      const { error: possessionError } = await supabase.from("possessions").insert([
        {
          point_id: pointId,
          possession_number: possessionNumber,
          offence_team: possessionOffenceTeam,
          defence_team: possessionDefenceTeam,
          defence_init: possession.defenceInit,
          defence_init_successful: possession.defenceInitSuccessful,
          offence_init: possession.offenceInit,
          offence_init_successful: possession.offenceInitSuccessful,
          offence_main: possession.offenceMain,
          defence_main: possession.defenceMain,
          throws: possession.throws,
          // Turnover fields
          turn_throw_zone: possession.turnThrowZone,
          turn_receive_zone: possession.turnReceiveZone,
          turn_thrower: possession.turnThrower,
          turn_intended_receiver: possession.turnIntendedReceiver,
          d_player: possession.dPlayer,
          turnover_reason: possession.turnoverReason,
          // Score fields
          score_player: possession.scorePlayer,
          assist_player: possession.assistPlayer,
          score_method: possession.scoreMethod,
          // Outcome
          outcome: possession.outcome,
        },
      ])

      if (possessionError) throw possessionError
    }

    return { success: true, pointId: point.point_id }
  } catch (error) {
    console.error("Error saving point:", error)
    throw error
  }
}

// Helper function to calculate timestamp URL
function calculateTimestampUrl(baseUrl: string, timestamp: string): string {
  // This is a placeholder implementation
  // You would implement the actual logic based on your requirements
  if (!baseUrl || !timestamp) return ""

  // Example: append ?t=1h23m45s to the URL for a timestamp of 1:23:45
  const formattedTimestamp = formatTimestampForUrl(timestamp)
  return `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}t=${formattedTimestamp}`
}

// Helper to format timestamp for URL
function formatTimestampForUrl(timestamp: string): string {
  // Convert timestamp like "1:23:45" to "1h23m45s" for URL
  // This is just an example implementation
  const parts = timestamp.split(":")
  let result = ""

  if (parts.length === 3) {
    result = `${parts[0]}h${parts[1]}m${parts[2]}s`
  } else if (parts.length === 2) {
    result = `${parts[0]}m${parts[1]}s`
  } else {
    result = `${parts[0]}s`
  }

  return result
}
