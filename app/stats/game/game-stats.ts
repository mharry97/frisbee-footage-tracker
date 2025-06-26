import type { PointDetailed } from "@/app/points/supabase";
import type { PossessionDetailed } from "@/app/possessions/supabase";
import type { EventDetail } from "@/app/events/supabase";

// Define the shape of a single calculated stat object
export type CalculatedStat = {
  label: string;
  teamOneValue: number;
  teamTwoValue: number;
  isPercentage: boolean;
};

export function calculateGameStats(
  points: PointDetailed[] | undefined,
  possessions: PossessionDetailed[] | undefined,
  eventData: EventDetail | null
): CalculatedStat[] {
  if (!points || !possessions || !eventData) {
    return [] as CalculatedStat[];
  }

  const teamOneId = eventData.team_1_id;
  const teamTwoId = eventData.team_2_id;

  // Calculate Turnovers
  const teamOneTurnovers = possessions.filter(p => p.offence_team === teamOneId && !p.is_score).length;
  const teamTwoTurnovers = possessions.filter(p => p.offence_team === teamTwoId && !p.is_score).length;

  // Calculate Throws
  const teamOneThrows = possessions
    .filter(p => p.offence_team === teamOneId)
    .reduce((sum, p) => sum + (p.throws ?? 0), 0);
  const teamTwoThrows = possessions
    .filter(p => p.offence_team === teamTwoId)
    .reduce((sum, p) => sum + (p.throws ?? 0), 0);

  // Calculate Clean Hold %
  const teamOneOffensivePoints = possessions.filter(p => p.point_offence_team === teamOneId && p.possession_number === 1).length;
  const teamOneCleanHolds = possessions.filter(p => p.point_offence_team === teamOneId && p.is_score && p.possession_number === 1).length;
  const teamOneCleanHoldPct = teamOneOffensivePoints > 0 ? (teamOneCleanHolds / teamOneOffensivePoints) * 100 : 0;
  console.log(possessions.length);

  const teamTwoOffensivePoints = possessions.filter(p => p.point_offence_team === teamTwoId && p.possession_number === 1).length;
  const teamTwoCleanHolds = possessions.filter(p => p.point_offence_team === teamTwoId && p.is_score && p.possession_number === 1).length;
  const teamTwoCleanHoldPct = teamTwoOffensivePoints > 0 ? (teamTwoCleanHolds / teamTwoOffensivePoints) * 100 : 0;

  // Calculate D-line Conversion % (Break %)
  const teamOneDefensivePoints = points.filter(p => p.defence_team === teamOneId).length;
  const teamOneBreaks = points.filter(p => p.defence_team === teamOneId && p.point_outcome === 'break').length;
  const teamOneDLineConversionPct = teamOneDefensivePoints > 0 ? (teamOneBreaks / teamOneDefensivePoints) * 100 : 0;

  const teamTwoDefensivePoints = points.filter(p => p.defence_team === teamTwoId).length;
  const teamTwoBreaks = points.filter(p => p.defence_team === teamTwoId && p.point_outcome === 'break').length;
  const teamTwoDLineConversionPct = teamTwoDefensivePoints > 0 ? (teamTwoBreaks / teamTwoDefensivePoints) * 100 : 0;

  return [
    { label: "Turnovers", teamOneValue: teamOneTurnovers, teamTwoValue: teamTwoTurnovers, isPercentage: false },
    { label: "Clean Hold %", teamOneValue: teamOneCleanHoldPct, teamTwoValue: teamTwoCleanHoldPct, isPercentage: true },
    { label: "D-Line Conversion %", teamOneValue: teamOneDLineConversionPct, teamTwoValue: teamTwoDLineConversionPct, isPercentage: true },
    { label: "Throws", teamOneValue: teamOneThrows, teamTwoValue: teamTwoThrows, isPercentage: false },
  ];
}
