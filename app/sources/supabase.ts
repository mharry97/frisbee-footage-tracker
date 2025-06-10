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

type SourceDetailed = Source & {
  points: number
}

type InsertSourceType = {
  title: string
  url: string
  recorded_date: string
}

// Upsert source
type UpsertSourceType = InsertSourceType & {
  source_id: string
}

// READING

// Fetch all sources from Supabase
export async function fetchSources(): Promise<SourceDetailed[]> {
    const { data, error } = await supabase
      .from("view_source_detail")
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

// WRITING

// Insert new source
export async function addSource(data : InsertSourceType) {
  const { error } = await supabase
    .from("sources")
    .insert(data)
   if (error) throw error;
}

export async function editSource(data: UpsertSourceType) {
  const { error } = await supabase
    .from("sources")
    .upsert(data, { onConflict: "source_id" })
  if (error) throw error;
}
