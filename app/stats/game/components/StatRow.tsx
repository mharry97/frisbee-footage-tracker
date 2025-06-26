"use client";

import {Box, Grid, Text, VStack} from "@chakra-ui/react";
import {useMemo} from "react";

// A small component for the comparison bar
const StatBar = ({ value, color }: { value: number; color: string }) => (
  <Box bg="gray.700" height="8px" borderRadius="full" overflow="hidden" mt={1} width="100%">
    <Box bg={color} height="100%" width={`${value}%`} />
  </Box>
);

interface StatRowProps {
  label: string;
  teamOneValue: number;
  teamTwoValue: number;
  isPercentage?: boolean;
}

export function StatRow({
                          label,
                          teamOneValue,
                          teamTwoValue,
                          isPercentage = false,
                        }: StatRowProps) {

  // Bar "size" calculation
  const { teamOneBarValue, teamTwoBarValue } = useMemo(() => {
    if (isPercentage) {
      // If it's a percentage, the value is the bar width
      return { teamOneBarValue: teamOneValue, teamTwoBarValue: teamTwoValue };
    } else {
      // For absolute numbers (like Turnovers, Throws)
      // 1. Find the larger of the two values to serve as our 100% mark
      const max = Math.max(teamOneValue, teamTwoValue);

      // 2. Calculate each bar's width as a percentage of that max value
      const teamOnePct = max > 0 ? (teamOneValue / max) * 100 : 0;
      const teamTwoPct = max > 0 ? (teamTwoValue / max) * 100 : 0;

      return { teamOneBarValue: teamOnePct, teamTwoBarValue: teamTwoPct };
    }
  }, [teamOneValue, teamTwoValue, isPercentage]);

  // Function to format the displayed value
  const formatValue = (value: number) => {
    return isPercentage ? value.toFixed(1) : value.toString();
  };

  return (
    <Grid templateColumns="1fr 1fr 1fr" alignItems="center" gap={4} width="100%">
      {/* --- Team One --- */}
      <VStack gap={0} alignItems="flex-end">
        <Text fontSize="2xl" fontWeight="bold">
          {formatValue(teamOneValue)}
        </Text>
        <StatBar value={teamOneBarValue} color="yellow.400" />
      </VStack>
      {/* --- Label --- */}
      <Text color="gray.400" textAlign="center" fontWeight="medium">
        {label}
      </Text>
      {/* --- Team Two --- */}
      <VStack gap={0} alignItems="flex-start">
        <Text fontSize="2xl" fontWeight="bold">
          {formatValue(teamTwoValue)}
        </Text>
        <StatBar value={teamTwoBarValue} color="gray.400" />
      </VStack>

    </Grid>
  );
}
