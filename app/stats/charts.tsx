import {
  Cell,
  LabelList,
  Legend,
  Pie,
  PieChart,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  ResponsiveContainer
} from "recharts";
import React from "react";


// PIE CHART
export type PieDataItem = {
  name: string;
  value: number;
};

export const myPieChart = (title: string, data: PieDataItem[]) => {
  if (!data.length) return <p>No data available</p>;
  const colorPalette = ["#facc15", "#a1a1aa"];
  return (
    <div className="w-full max-w-sm flex flex-col items-center mx-auto">
      <h2 className="text-center font-semibold mb-0 w-full">{title}</h2>
      <PieChart width={300} height={300}>
        <Legend verticalAlign="bottom" height={36} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          outerRadius={100}
          innerRadius={60}
          stroke="none"
          labelLine={false}
        >
          <LabelList position="inside" fill="white" stroke="none" />
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colorPalette[index % colorPalette.length]} />
          ))}
        </Pie>
      </PieChart>
    </div>
  );
};

// STACKED BAR CHART
export type StackedBarItem = {
  name: string;
  [key: string]: string | number;
};
export const myStackedBarChart = (title: string, data: StackedBarItem[], keys: string[]) => {
  if (!data.length) return <p>No data available</p>;
  const colorPalette = ["#facc15", "#a1a1aa", "#ffffff"];
  return (
    <div className="w-full max-w-sm flex flex-col items-center mx-auto mb-12">
      <h2 className="text-center font-semibold w-full">{title}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 50, bottom: 5 }}
        >
          <XAxis type="number" />
          <YAxis type="category" dataKey="name" />
          <Legend />
          {keys.map((key, i) => (
            <Bar
              key={key}
              dataKey={key}
              fill={colorPalette[i % colorPalette.length]}
              stackId="a"
              barSize={20}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};


// TABLE
export type GenericTableItem = {
  [key: string]: string | number;
};

interface DynamicTableProps {
  title?: string;
  data: GenericTableItem[];
  keys: string[];
}

export const MyDynamicTable = ({ title, data, keys }: DynamicTableProps) => {
  if (!data.length) return <p>No data available</p>;

  return (
    <div className="w-full max-w-xl flex flex-col items-center mx-auto mb-12">
      {title && <h2 className="text-center font-semibold mb-4 w-full">{title}</h2>}
      <table className="w-full text-sm">
        <thead>
          <tr>
            {keys.map((key, idx) => (
              <th
                key={key}
                className={`py-2 px-3 capitalize font-medium text-neutral-300 border-b border-neutral-700 ${idx === keys.length - 1 ? "text-right" : "text-left"}`}
              >
                {key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, rowIdx) => (
            <tr key={rowIdx} className="border-b border-neutral-800">
              {keys.map((key, idx) => (
                <td
                  key={key}
                  className={`py-2 px-3 ${idx === keys.length - 1 ? "text-right" : "text-left"}`}
                >
                  {String(item[key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
