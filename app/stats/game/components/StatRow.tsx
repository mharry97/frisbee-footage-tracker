"use client";

import { useMemo } from "react";

const StatBar = ({ value, color }: { value: number; color: string }) => (
  <div className="bg-neutral-700 h-2 rounded-full overflow-hidden mt-1 w-full">
    <div style={{ width: `${value}%`, backgroundColor: color, height: "100%" }} />
  </div>
);

interface StatRowProps {
  label: string;
  teamOneValue: number;
  teamTwoValue: number;
  isPercentage?: boolean;
}

export function StatRow({ label, teamOneValue, teamTwoValue, isPercentage = false }: StatRowProps) {
  const { teamOneBarValue, teamTwoBarValue } = useMemo(() => {
    if (isPercentage) {
      return { teamOneBarValue: teamOneValue, teamTwoBarValue: teamTwoValue };
    }
    const max = Math.max(teamOneValue, teamTwoValue);
    return {
      teamOneBarValue: max > 0 ? (teamOneValue / max) * 100 : 0,
      teamTwoBarValue: max > 0 ? (teamTwoValue / max) * 100 : 0,
    };
  }, [teamOneValue, teamTwoValue, isPercentage]);

  const formatValue = (value: number) =>
    isPercentage ? value.toFixed(1) : value.toString();

  return (
    <div className="grid grid-cols-3 items-center gap-4 w-full">
      <div className="flex flex-col items-end">
        <span className="text-2xl font-bold">{formatValue(teamOneValue)}</span>
        <StatBar value={teamOneBarValue} color="#facc15" />
      </div>
      <span className="text-neutral-400 text-center font-medium">{label}</span>
      <div className="flex flex-col items-start">
        <span className="text-2xl font-bold">{formatValue(teamTwoValue)}</span>
        <StatBar value={teamTwoBarValue} color="#737373" />
      </div>
    </div>
  );
}
