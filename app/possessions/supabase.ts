import {Possession, supabase} from "@/lib/supabase";

// Fetch basic info for all possessions from Supabase for a given event_id
export async function fetchEventPossessions(event_id: string): Promise<Possession[]> {
  try {
    const { data, error } = await supabase
      .from("possessions")
      .select("*, points!inner()")
      .eq("points.event_id", event_id);

    if (error) throw error;

    return data?? [];
  } catch (error) {
    console.error("Error fetching possession info:", error);
    return [];
  }
}

export async function deletePossession(point_id: string, possession_number: number): Promise<void> {
  const { error } = await supabase
    .from("possessions")
    .delete()
    .match({ point_id, possession_number });

  if (error) {
    console.error("Failed to delete possession:", error);
    throw error;
  }
}
