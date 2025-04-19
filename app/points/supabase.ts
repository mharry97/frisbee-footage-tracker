import { supabase } from "@/lib/supabase";
import type { Point } from "@/lib/supabase";

// Fetch basic info for all points from Supabase for a given event_id
export async function fetchEventPoints(event_id: string): Promise<Point[]> {
  try {
    const { data, error } = await supabase
      .from("points")
      .select("*")
      .eq("event_id", event_id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((point) => ({
      offence_team: point.offence_team,
      timestamp: point.timestamp,
      is_break: point.is_break,
      created_at: point.created_at,
      point_id: point.point_id,
      event_id: point.event_id,
      defence_team: point.defence_team,
      source_id: point.source_id,
      base_url: point.base_url,
      timestamp_url: point.timestamp_url
    }));
  } catch (error) {
    console.error("Error fetching points:", error);
    return [];
  }
}
