import { v4 as uuidv4 } from "uuid";
import { upsertPlayer } from "@/app/events/[id]/[point_id]/supabase";
import type { Player } from "@/lib/supabase";

export async function getOrCreatePlayerId(
  value: string,
  teamId: string,
  playerList: Player[]
): Promise<string | null> {
  const trimmed = value.trim();

  // If it's empty, return null
  if (!trimmed) return null;

  // If it's already in the playerList as an ID, return it directly
  const foundById = playerList.find((p) => p.player_id === trimmed);
  if (foundById) return foundById.player_id;

  // If it's a known name, return the matching ID
  const foundByName = playerList.find((p) => p.player_name === trimmed);
  if (foundByName) return foundByName.player_id;

  // Otherwise, create a new UUID and upsert
  const newId = uuidv4();
  await upsertPlayer(trimmed, teamId, newId);

  return newId;
}
