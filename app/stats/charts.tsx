import {Flex, Heading, Table, Text} from "@chakra-ui/react";
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
  if (!data.length) return <Text>No data available</Text>;
  const colorPalette = [
    "#facc15",
    "#a1a1aa"
  ]
  return (
    <Flex
      width="100%"
      maxW="360px"
      flexDirection="column"
      alignItems="center"
      mx="auto"
    >
      <Heading size="md" textAlign="center" mb={-2} width="100%">
        {title}
      </Heading>
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
          paddingAngle={8}
        >
          <LabelList position="inside" fill="white" stroke="none" />
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colorPalette[index % colorPalette.length]} />
          ))}
        </Pie>
      </PieChart>
    </Flex>
  );
};

// STACKED BAR CHART
export type StackedBarItem = {
  name: string;
  [key: string]: string | number;
};
export const myStackedBarChart = (title: string, data: StackedBarItem[], keys: string[]) => {
  if (!data.length) return <Text>No data available</Text>;
  const colorPalette = [
    "#facc15",
    "#a1a1aa",
    "#ffffff",
  ]
  return (
    <Flex
      width="100%"
      maxW="400px"
      flexDirection="column"
      alignItems="center"
      mx="auto"
      mb={12}
    >
      <Heading size="md" textAlign="center" width="100%">
        {title}
      </Heading>

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
    </Flex>
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
  if (!data.length) return <Text>No data available</Text>;

  return (
    <Flex
      width="100%"
      maxW="600px"
      flexDirection="column"
      alignItems="center"
      mx="auto"
      mb={12}
    >
      {title && (
        <Heading size="md" textAlign="center" mb={4} width="100%">
          {title}
        </Heading>
      )}
      <Table.Root size="sm">
        <Table.Header>
          <Table.Row>
            {keys.map((key, idx) => (
              <Table.ColumnHeader
                key={key}
                textTransform="capitalize"
                textAlign={idx === keys.length - 1 ? "end" : "start"}
              >
                {key}
              </Table.ColumnHeader>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data.map((item, rowIdx) => (
            <Table.Row key={rowIdx}>
              {keys.map((key, idx) => (
                <Table.Cell
                  key={key}
                  textAlign={idx === keys.length - 1 ? "end" : "start"}
                >
                  {String(item[key])}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Flex>
  );
};
