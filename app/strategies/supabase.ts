import { supabase } from "@/lib/supabase"

// TYPES

export type Strategy = {
  strategy: string
  play_type: string
  strategy_type: string
  description:string
  strategy_id: string
}

export type UpsertStrategy = {
  strategy: string
  play_type: string
  strategy_type: string
  description:string
  strategy_id?: string
}

// READING

// Get all strategies for a strategy type
export async function fetchStrategiesByType(type: string): Promise<Strategy[]> {
  const { data, error } = await supabase
    .from("strategies")
    .select("*")
    .eq("play_type", type)
    .order("strategy_type", {ascending: true})
    .order("strategy", {ascending: true})

  if (error) throw error;
  return data || []
}

// Get all strategies
export async function fetchStrategies(): Promise<Strategy[]> {
  const { data, error } = await supabase
    .from("strategies")
    .select("*")
    .order("strategy_type", {ascending: true})
    .order("strategy", {ascending: true})

  if (error) throw error;
  return data || []
}

export type StratType = {
  strategy_type: string
}
// Get all strategy play types
export async function fetchStratTypes(): Promise<StratType[]> {
  const { data, error } = await supabase
    .from("view_strat_type_distinct")
    .select("*")
    .order("strategy_type", {ascending: true})

  if (error) throw error;
  return data || []
}

// Add/update a strategy
export async function upsertStrat(payload: UpsertStrategy): Promise<void> {
  const { error } = await supabase
    .from("strategies")
    .upsert(payload)

  if (error) throw error
}
