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

    return data ?? null
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
  userTitle: string,
  userDate: string,
  userType: "Game" | "Training" | "Scrimmage",
  userTeam1: string,
  userTeam2: string
) {
  let eventName = userTitle;
  const type = userType;
  let team1: string | null = null;
  let team2: string | null = null;

  // If "Training":
  // event_name = "Training", team_1 = null, team_2 = null
  if (userType === "Training") {
    eventName = "Training";
    team1 = "None";
    team2 = "None";
  }
    // If "Scrimmage":
  // event_name = "Scrimmage", fetch the home team for both team_1 and team_2
  else if (userType === "Scrimmage") {
    eventName = "Scrimmage";
    const homeName = await getHomeTeam();
    // If no home team is found, use "None" or throw an error
    team1 = homeName ?? "None";
    team2 = homeName ?? "None";
  }
    // If "Game":
  // event_name = userTitle, team_1 = userTeam1, team_2 = userTeam2
  else if (userType === "Game") {
    team1 = userTeam1 || null;
    team2 = userTeam2 || null;
  }

  const { data, error } = await supabase
    .from("events")
    .insert([
      {
        event_name: eventName,
        event_date: userDate,
        type,
        team_1: team1,
        team_2: team2,
      },
    ])
    .single();

  if (error) {
    console.error("Error inserting event:", error);
    throw new Error("Failed to insert event");
  }

  return data;
}



