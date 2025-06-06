import { supabase } from "@/lib/supabase"

// Type definitions for database tables
export type Source = {
  source_id: string
  created_at: string
  title: string
  url: string
  recorded_date: string
  created_by: string
}

// Fetch all sources from Supabase
export async function fetchSources(): Promise<Source[]> {
    const { data, error } = await supabase
      .from("sources")
      .select("*")
      .order("recorded_date", { ascending: false })
      .order("title", { ascending: true });

    if (error) throw error;
    return data || []
}

// Fetch single source
export async function fetchSourceById(id: string): Promise<Source[]> {
    const { data, error } = await supabase
      .from("sources")
      .select("*")
      .eq("source_id", id)

    if (error) throw error;

    return data || ""
}
