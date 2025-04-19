import { supabase } from "@/lib/supabase"
import type { Source } from "@/lib/supabase"

// Fetch all sources from Supabase
export async function fetchSources(): Promise<Source[]> {
  try {
    const { data, error } = await supabase
      .from("sources")
      .select("*")
      .order("recorded_date", { ascending: false });

    if (error) throw error;

    return (data || []).map((source) => ({
      id: source.id,
      created_at: source.created_at,
      title: source.title,
      url: source.url,
      recorded_date: source.recorded_date
    }));
  } catch (error) {
    console.error("Error fetching sources:", error);
    return [];
  }
}

// Insert row to source table
export async function insertSource(
  title: string,
  url: string,
  recordedDate: string
): Promise<void> {
  const { error } = await supabase
    .from("sources")
    .insert([{ title, url, recorded_date: recordedDate }])
    .single();

  if (error) throw error;
}

// Fetch single source
export async function fetchSourceById(id: string): Promise<Source[]> {
  try {
    const { data, error } = await supabase
      .from("sources")
      .select("*")
      .eq("id", id)

    if (error) throw error;

    return (data || []).map((source) => ({
      id: source.id,
      created_at: source.created_at,
      title: source.title,
      url: source.url,
      recorded_date: source.recorded_date
    }));
  } catch (error) {
    console.error("Error fetching sources:", error);
    return [];
  }
}
