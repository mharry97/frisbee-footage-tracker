import React from "react";
import DataTable, { createTheme } from 'react-data-table-component';
import {SearchPlayer} from "@/app/playersearch/supabase.ts";
import DataTableExtensions from "react-data-table-component-extensions";

// Accepts statline object
interface PlayerSearchTableProps {
  data: SearchPlayer[];
  onRowClick: (row: SearchPlayer) => void;
}

// Define the columns
const columns = [
  {
    name: 'Event',
    selector: (row: SearchPlayer) => row.event_name,
    sortable: true,
    width: '200px'
  },
  {
    name: 'Team',
    selector: (row: SearchPlayer) => row.event_team_name,
    sortable: true,
    width: '200px'
  },
  {
    name: 'Player',
    selector: (row: SearchPlayer) => row.event_player_name,
    sortable: true,
    width: '200px'
  },
  {
    name: '#',
    selector: (row: SearchPlayer) => row.event_player_number,
    sortable: true,
    width: '100px',
  },
  {
    name: 'Games',
    selector: (row: SearchPlayer) => row.games,
    sortable: true,
    width: '120px',
  },
  {
    name: 'Goals',
    selector: (row: SearchPlayer) => row.goals,
    sortable: true,
    width: '100px',
  },
  {
    name: 'Assists',
    selector: (row: SearchPlayer) => row.assists,
    sortable: true,
    width: '140px',
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


export function PlayerSearchTable({ data, onRowClick }: PlayerSearchTableProps) {
  // On click open import player modal
  const handleRowClicked = (row: SearchPlayer) => {
    onRowClick(row);
  };
  const tableData = {
    columns,
    data,
  };

  return (
    <DataTableExtensions
      {...tableData}
      print={false}
      export={false}
    >
      <DataTable
        columns={columns}
        data={data}
        theme="solarized"
        pagination
        highlightOnHover
        pointerOnHover
        onRowClicked={handleRowClicked}
      />
    </DataTableExtensions>
  );
}
