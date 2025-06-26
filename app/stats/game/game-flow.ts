import type { EventDetail } from "@/app/events/supabase";
import type { PointDetailed } from "@/app/points/supabase";
import { convertTimestampToSeconds } from "@/lib/utils";

// Game flow chart
// Define the shape of data required
export type ScoreChartDataPoint = {
  pointNumber: number;
  teamOneScore: number;
  teamTwoScore: number;
};

export function transformPointsForScoreChart(
  points: PointDetailed[],
  eventData: EventDetail | null
): ScoreChartDataPoint[] {
  if (!points || !eventData) {
    return [];
  }

  // Ensure points are in chronological order
  const sortedPoints = [...points].sort(
    (a, b) =>
      convertTimestampToSeconds(a.timestamp) - convertTimestampToSeconds(b.timestamp)
  );

  const chartData: ScoreChartDataPoint[] = [{ pointNumber: 0, teamOneScore: 0, teamTwoScore: 0 }];

  let teamOneScore = 0;
  let teamTwoScore = 0;

  const teamOneName = eventData.team_1;
  const teamTwoName = eventData.team_2;

  sortedPoints.forEach((point, index) => {
    const pointNumber = index + 1;
    let scoringTeamName: string | null = null;

    if (point.point_outcome === 'hold') {
      scoringTeamName = point.offence_team_name;
    } else if (point.point_outcome === 'break') {
      scoringTeamName = point.defence_team_name;
    }

    if (scoringTeamName === teamOneName) {
      teamOneScore++;
    } else if (scoringTeamName === teamTwoName) {
      teamTwoScore++;
    }

    chartData.push({
      pointNumber,
      teamOneScore,
      teamTwoScore,
    });
  });

  return chartData;
}
