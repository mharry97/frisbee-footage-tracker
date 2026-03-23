import React from "react";

export type PossessionOverviewProps = {
  offence_team: string;
  throws: number;
  outcome: string;
};

export default function PossessionOverview({ offence_team, throws, outcome }: PossessionOverviewProps) {
  return (
    <div className="flex justify-between w-4/5 mx-auto gap-6">
      <div className="flex flex-col items-center gap-1">
        <span className="font-bold">Offence Team</span>
        <span className="text-yellow-400 font-bold">{offence_team}</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="font-bold">Throws</span>
        <span className="text-yellow-400 font-bold">{throws}</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="font-bold">Outcome</span>
        <span className="text-yellow-400 font-bold">{outcome}</span>
      </div>
    </div>
  );
}
