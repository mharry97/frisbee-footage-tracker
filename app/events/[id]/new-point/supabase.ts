import { supabase } from "@/lib/supabase"
import type { Point, PointPlayer } from "@/lib/supabase"


export type NewPoint = Pick<Point, "event_id" | "source_id" | "timestamp" | "offence_team" | "defence_team">;

// Write point to Supabase
export async function writePoint(pointData: NewPoint): Promise<Point[]> {
   // Insert and return the newly created row(s)
    const { data: insertedData, error } = await supabase
      .from("points")
      .insert(pointData)
      .select(); // returns newly created row(s)

    if (error || !insertedData) {
      throw error;
    }
    return insertedData || error
}

// Write points players
export async function writePointPlayers(pointPlayersData: {
  point_id: string;
  player_id: string
}[]): Promise<PointPlayer[]> {
    // Insert and return the newly created row(s)
    const { data: insertedData, error } = await supabase
      .from("point_players")
      .insert(pointPlayersData)
      .select();

    if (error || !insertedData) {
      throw error;
    }
    return insertedData || []
}
