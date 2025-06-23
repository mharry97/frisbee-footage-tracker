import { supabase } from "@/lib/supabase"
import {PlayerDetailed} from "@/app/players/supabase.ts";

// TYPES

export type Strategy = {
  strategy: string
  play_type: string
  strategy_type: string
  description:string
  strategy_id: string
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
