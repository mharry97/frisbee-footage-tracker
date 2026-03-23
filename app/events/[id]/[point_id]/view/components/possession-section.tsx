import React from "react";
import PossessionOverview from "@/app/events/[id]/[point_id]/view/components/possession-overview";
import PossessionPlays from "@/app/events/[id]/[point_id]/view/components/possession-plays";
import PossessionOutcomeTurnover from "@/app/events/[id]/[point_id]/view/components/possession-outcome";
import type { PossessionOutcomeProps } from "./possession-outcome";
import type { PossessionPlayProps } from "./possession-plays";
import type { PossessionOverviewProps } from "./possession-overview";

type PointSectionProps = {
  overview: PossessionOverviewProps;
  plays: PossessionPlayProps;
  turnover: PossessionOutcomeProps;
};

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 mb-4 mt-4">
      <hr className="flex-1 border-neutral-700" />
      <span className="text-xl shrink-0">{label}</span>
      <hr className="flex-1 border-neutral-700" />
    </div>
  );
}

export default function PossessionSection({ overview, plays, turnover }: PointSectionProps) {
  return (
    <div className="mb-4">
      <SectionDivider label="Overview" />
      <div className="p-4 w-full mb-4">
        <PossessionOverview {...overview} />
      </div>
      <SectionDivider label="Plays" />
      <div className="p-4 w-full mb-4">
        <PossessionPlays {...plays} />
      </div>
      <SectionDivider label="Outcome" />
      <div className="p-4 w-full mb-4">
        <PossessionOutcomeTurnover {...turnover} />
      </div>
    </div>
  );
}
