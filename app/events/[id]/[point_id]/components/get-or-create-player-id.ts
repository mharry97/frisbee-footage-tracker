import { v4 as uuidv4 } from "uuid";
import { upsertPlayer } from "@/app/events/[id]/[point_id]/supabase";
import type { Player } from "@/lib/supabase";

export async function getOrCreatePlayerId(
  value: string,
  teamId: string,
  playerList: Player[]
): Promise<string | null> {
  const trimmed = value.trim();

  if (!trimmed) return null;

  const foundById = playerList.find((p) => p.player_id === trimmed);
  if (foundById) return foundById.player_id;

  const foundByName = playerList.find((p) => p.player_name === trimmed);
  if (foundByName) return foundByName.player_id;

  const newId = uuidv4();
  const { error } = await upsertPlayer(trimmed, teamId, newId);

  if (error) {
    console.error("Failed to insert player", {
      name: trimmed,
      teamId,
      newId,
      error,
    });
    return null;
  }

  console.log("New player inserted:", { name: trimmed, newId });
  return newId;
}
