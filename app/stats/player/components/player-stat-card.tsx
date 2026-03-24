"use client";

import type { PlayerStatLine } from "@/app/stats/player/player-base-stats";
import NextLink from "next/link";
import React from "react";

interface StatLeaderCardProps {
  label: string;
  player?: PlayerStatLine;
  statValue?: number;
}

export function StatLeaderCard({ label, player, statValue }: StatLeaderCardProps) {
  if (!player) {
    return (
      <div className="border border-neutral-800 rounded-lg p-4 opacity-50">
        <div className="flex flex-col items-center gap-2">
          <span>{label}</span>
          <span className="text-2xl font-bold text-neutral-500">-</span>
          <span className="text-sm text-neutral-500 italic">No Data</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <span className="text-sm text-neutral-400 mb-2">{label}</span>
      <NextLink href={`/players/${player.player_id}`}>
        <div className="rounded-lg p-4 hover:bg-neutral-900 transition-colors flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-sm font-medium shrink-0">
            {player.player_name.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm">{player.player_name}</span>
          <span className="text-2xl text-yellow-400 font-bold">{statValue}</span>
        </div>
      </NextLink>
    </div>
  );
}
