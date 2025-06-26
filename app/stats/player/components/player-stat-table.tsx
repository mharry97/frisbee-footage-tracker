"use client";

import React from "react";
import DataTable, { createTheme } from 'react-data-table-component';
import type { PlayerStatLine } from "@/app/stats/player/player-base-stats";
import {useRouter} from "next/navigation";

// Accepts statline object
interface PlayerStatsTableProps {
  data: PlayerStatLine[];
}

// Define the columns
const columns = [
  {
    name: 'Player',
    selector: (row: PlayerStatLine) => row.player_name,
    sortable: true,
  },
  {
    name: 'Points Played',
    selector: (row: PlayerStatLine) => row.points_played,
    sortable: true,
    width: '150px',
  },
  {
    name: 'Scores',
    selector: (row: PlayerStatLine) => row.scores,
    sortable: true,
    width: '120px',
  },
  {
    name: 'Assists',
    selector: (row: PlayerStatLine) => row.assists,
    sortable: true,
    width: '120px',
  },
  {
    name: 'Ds',
    selector: (row: PlayerStatLine) => row.ds,
    sortable: true,
    width: '100px',
  },
  {
    name: 'Turnovers',
    selector: (row: PlayerStatLine) => row.turnovers,
    sortable: true,
    width: '140px',
  },
  {
    name: '+/-',
    selector: (row: PlayerStatLine) => row.plus_minus,
    sortable: true,
    width: '100px',
  },
];

// Custom dark theme
createTheme('solarized', {
  text: {
    primary: '#FFFFFF',
    secondary: '#b1b1b1',
  },
  background: {
    default: 'transparent',
  },
  context: {
    background: '#cb4b16',
    text: '#FFFFFF',
  },
  divider: {
    default: '#373737',
  },
  action: {
    button: 'rgba(0,0,0,.54)',
    hover: 'rgba(0,0,0,.08)',
    disabled: 'rgba(0,0,0,.12)',
  },
}, 'dark');


export function PlayerStatsTable({ data }: PlayerStatsTableProps) {
  const router = useRouter();

  // On click send user to player page
  const handleRowClicked = (row: PlayerStatLine) => {
    router.push(`/players/${row.player_id}`);
  };

  return (
    <DataTable
      columns={columns}
      data={data}
      theme="solarized"
      pagination
      highlightOnHover
      pointerOnHover
      onRowClicked={handleRowClicked}
    />
  );
}
