import React from "react";

export type PossessionPlayProps = {
  d_init: string;
  d_main: string;
  o_init: string;
  o_main: string;
};

export default function PossessionPlays({ d_init, d_main, o_init, o_main }: PossessionPlayProps) {
  return (
    <div className="grid p-4 rounded-md justify-center" style={{ gridTemplateColumns: "auto auto auto", gap: "1rem" }}>
      <div />
      <span className="font-bold text-neutral-300">Initiation</span>
      <span className="font-bold text-neutral-300">Main</span>

      <span className="font-bold">O</span>
      <span className="font-bold text-yellow-400">{o_init}</span>
      <span className="font-bold text-yellow-400">{o_main}</span>

      <span className="font-bold">D</span>
      <span className="font-bold text-yellow-400">{d_init}</span>
      <span className="font-bold text-yellow-400">{d_main}</span>
    </div>
  );
}
