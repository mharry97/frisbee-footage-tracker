import React from "react";

export type PossessionOutcomeProps = {
  throw_zone: number;
  receive_zone: number;
  thrower: string;
  receiver: string;
  turnover_reason: string;
  d_player: string;
  scorer: string;
  assister: string;
  method: string;
  outcome: string;
};

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-1">
      <span className="font-bold">{label}</span>
      <span className="text-yellow-400 font-bold">{value}</span>
    </div>
  );
}

export default function PossessionOutcomeDetails({
  throw_zone,
  receive_zone,
  thrower,
  receiver,
  turnover_reason,
  d_player,
  scorer,
  assister,
  method,
  outcome,
}: PossessionOutcomeProps) {
  return outcome === "Turnover" ? (
    <div className="flex flex-col items-center gap-6 mb-4 mt-4">
      <img src="/pitch-zoned.png" alt="Pitch Zoned" className="mb-4" />
      <div className="grid grid-cols-2 gap-x-20 gap-y-7">
        <StatBox label="Thrown From" value={String(throw_zone)} />
        <StatBox label="Thrown To" value={String(receive_zone)} />
        <StatBox label="Thrower" value={thrower} />
        <StatBox label="Receiver" value={receiver} />
        <StatBox label="Turnover Reason" value={turnover_reason} />
        <StatBox label="D Player" value={d_player} />
      </div>
    </div>
  ) : (
    <div className="flex justify-between w-4/5 mx-auto gap-6">
      <div className="flex flex-col items-center gap-1">
        <span className="font-bold">Score Player</span>
        <span className="text-yellow-400 font-bold">{scorer}</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="font-bold">Assist Player</span>
        <span className="text-yellow-400 font-bold">{assister}</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="font-bold">Method</span>
        <span className="text-yellow-400 font-bold">{method}</span>
      </div>
    </div>
  );
}
