import React from "react";
import { PlayerDetailed } from "@/app/players/supabase.ts";
import NextLink from "next/link";

interface PlayerGridProps {
  players: PlayerDetailed[];
}

export function PlayerGrid({ players }: PlayerGridProps) {
  if (!players || players.length === 0) {
    return (
      <div className="flex items-center justify-center p-4">
        <p className="text-neutral-400">No players found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
      {players.map((item) => (
        <NextLink key={item.player_id} href={`/players/${item.player_id}`}>
          <div className="border border-neutral-800 rounded-lg p-4 hover:bg-neutral-900 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-sm font-medium text-neutral-100 shrink-0">
                {item.number ?? item.player_name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm">{item.player_name}</span>
            </div>
          </div>
        </NextLink>
      ))}
    </div>
  );
}
