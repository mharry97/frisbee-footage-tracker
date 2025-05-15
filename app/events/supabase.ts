import { supabase } from "@/lib/supabase"
import type { Event } from "@/lib/supabase"
import {getHomeTeam} from "@/app/teams/supabase";

// Fetch all events from Supabase
export async function fetchEvents(): Promise<Event[]> {
  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: false });

    if (error) throw error;

    return data ?? []
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

// Fetch specific event
export async function fetchEvent(event_id: string): Promise<Event | null> {
  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("event_id", event_id)
      .single();

    if (error) throw error;
    return data ?? null;
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
}

// Insert event
export async function insertEvent(
  title:     string,
  date:      string,
  type:      'Game' | 'Training' | 'Scrimmage',
  team1Id?:  string,
  team2Id?:  string
): Promise<Event> {
  // Event name is either the game title, or just the type string
  const event_name = type === 'Game' ? title : type

  let team_1_id: string | null = null
  let team_2_id: string | null = null

  if (type === 'Game') {
    team_1_id = team1Id ?? null
    team_2_id = team2Id ?? null

  } else if (type === 'Scrimmage') {
    // For scrimmages, look up the home team
    const homeId = await getHomeTeam()
    team_1_id = homeId
    team_2_id = homeId
  }
  // If training leave teams as null

  const { data, error } = await supabase
    .from('events')
    .insert({
      event_name,
      event_date: date,
      type,
      team_1_id,
      team_2_id,
    })
    .single()

  if (error) {
    console.error('Error inserting event:', error)
    throw error
  }
  return data
}



