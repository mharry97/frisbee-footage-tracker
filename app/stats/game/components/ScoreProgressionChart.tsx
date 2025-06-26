"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { ScoreChartDataPoint } from "@/app/stats/game/game-flow.ts";

interface ChartProps {
  data: ScoreChartDataPoint[];
  teamOneName: string;
  teamTwoName: string;
}

export default function ScoreProgressionChart({ data, teamOneName, teamTwoName }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)" />
        <XAxis dataKey="pointNumber" stroke="rgba(255, 255, 255, 0.7)" />
        <YAxis stroke="rgba(255, 255, 255, 0.7)" />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(20, 20, 20, 0.8)",
            borderColor: "rgba(255, 255, 255, 0.2)",
          }}
        />
        <Legend />
        <Line
          dataKey="teamOneScore"
          name={teamOneName}
          stroke="#ffdf00"
          strokeWidth={3}
          dot={false}
        />
        <Line
          dataKey="teamTwoScore"
          name={teamTwoName}
          stroke="gray"
          strokeWidth={3}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
