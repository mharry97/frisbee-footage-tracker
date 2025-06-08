import { supabase } from "@/lib/supabase"
import {getHomeTeam} from "@/app/teams/supabase";

export type Event = {
  event_id: string
  event_name: string
  event_date: string
  type: "Game" | "Training" | "Scrimmage"
  team_1_id: string
  team_2_id: string
}

export type EventDetail = {
  event_id: string
  event_name: string
  event_date: string
  type: "Game" | "Training" | "Scrimmage"
  team_1_id: string
  team_1: string
  team_1_scores: number
  team_2_id: string
  team_2: string
  team_2_scores: number
}


// Fetch all events from Supabase
export async function fetchEvents(): Promise<EventDetail[]> {
  try {
    const { data } = await supabase
      .from("view_events_detail")
      .select("*")
      .order("event_date", { ascending: false });

    return data ?? []
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

// Fetch specific event
export async function fetchEvent(event_id: string): Promise<Event | null> {
  try {
    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("event_id", event_id)
      .single();

    return data ?? [];
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
}

type AddEvent = {
  event_name:     string,
  event_date:      string,
  type:      'Game' | 'Training' | 'Scrimmage',
  team_1_id?:  string,
  team_2_id?:  string
}

// Insert event
export async function addEvent(data: AddEvent): Promise<void> {
  // Event name is either the game title, or just the type string
  const event_name = data.type === 'Game' ? data.event_name : data.type

  let team_1_id: string | null = null
  let team_2_id: string | null = null

  if (data.type === 'Game') {
    team_1_id = data.team_1_id ?? null
    team_2_id = data.team_2_id ?? null

  } else if (data.type === 'Scrimmage') {
    // For scrimmages, look up the home team
    const homeId = await getHomeTeam()
    team_1_id = homeId
    team_2_id = homeId
  }
  // If training leave teams as null

  const { error } = await supabase
    .from('events')
    .insert({
      event_name,
      event_date: data.event_date,
      type: data.type,
      team_1_id,
      team_2_id,
    })

  if (error) {
    console.error('Error inserting event:', error)
    throw error
  }
}

// Upsert event
export async function editEvent(data: Event): Promise<void> {
 const { error } = await supabase
   .from("events")
   .upsert(data);

  if (error) throw error;

}
