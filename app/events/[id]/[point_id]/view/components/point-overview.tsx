import React from "react";

type PointOverviewProps = {
  last_possession_type: string;
  possessions: number;
  scorer: string;
  outcome: string;
};

export default function PointOverview({
  last_possession_type,
  possessions,
  scorer,
  outcome,
}: PointOverviewProps) {
  const turns = possessions - 1;

  return (
    <div className="py-8 px-0">
      {last_possession_type === "Turnover" ? (
        <p className="text-neutral-400">
          No scoring possession has been added yet. Currently {possessions} possessions have been recorded.
        </p>
      ) : (
        <div className="flex justify-between w-4/5 mx-auto gap-6">
          <div className="flex flex-col items-center gap-1">
            <span className="font-bold">Outcome</span>
            <span className="text-yellow-400 font-bold">{outcome}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="font-bold">Turns</span>
            <span className="text-yellow-400 font-bold">{turns}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="font-bold">Scorer</span>
            <span className="text-yellow-400 font-bold">{scorer}</span>
          </div>
        </div>
      )}
    </div>
  );
}
