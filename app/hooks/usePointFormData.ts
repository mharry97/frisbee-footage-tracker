"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPoint } from "@/app/points/supabase";
import { fetchPointPossessions, PossessionDetailed } from "@/app/possessions/supabase";
import { getPlayersForTeam, PlayerDetailed } from "@/app/players/supabase";
import { fetchStrategiesByType, Strategy } from "@/app/strategies/supabase";
import { useMemo } from "react";

const outcomeOptions = ["Turnover", "Score"] as const;
const turnoverReasons = ["Drop", "Throw Away", "Block", "Stallout"] as const;
const scoreMethods = ["Flow", "Deep Shot", "Endzone"] as const;

async function fetchPointPageData(point_id: string) {
  const pointData = await fetchPoint(point_id);
  if (!pointData) {
    throw new Error("Point not found.");
  }

  const [
    possessionsData,
    offencePlayers,
    defencePlayers,
    dInitStrats,
    oInitStrats,
    dMainStrats,
    oMainStrats,
  ] = await Promise.all([
    fetchPointPossessions(point_id),
    getPlayersForTeam(pointData.offence_team),
    getPlayersForTeam(pointData.defence_team),
    fetchStrategiesByType("defence_initiation"),
    fetchStrategiesByType("offence_initiation"),
    fetchStrategiesByType("defence_main"),
    fetchStrategiesByType("offence_main"),
  ]);
  return {
    point: pointData,
    possessions: possessionsData as PossessionDetailed[],
    dropdownLists: {
      offencePlayers,
      defencePlayers,
      dInitStrats,
      oInitStrats,
      dMainStrats,
      oMainStrats,
    },
  };
}

export type PointPageData = Awaited<ReturnType<typeof fetchPointPageData>>;

export function usePointFormData(point_id: string) {
  return useQuery({
    queryKey: ["pointPageData", point_id],
    queryFn: () => fetchPointPageData(point_id),
    enabled: !!point_id,
  });
}

export function usePointFormCollections(data: PointPageData | undefined) {
  const { dropdownLists } = data || {
    dropdownLists: {
      offencePlayers: [] as PlayerDetailed[],
      defencePlayers: [] as PlayerDetailed[],
      dInitStrats: [] as Strategy[],
      oInitStrats: [] as Strategy[],
      dMainStrats: [] as Strategy[],
      oMainStrats: [] as Strategy[],
    },
  };

  const offenceCollection = useMemo(
    () => ({ items: dropdownLists?.offencePlayers ?? [] }),
    [dropdownLists]
  );

  const defenceCollection = useMemo(
    () => ({ items: dropdownLists?.defencePlayers ?? [] }),
    [dropdownLists]
  );

  const stratCollections = useMemo(
    () => ({
      dInitCollection: { items: dropdownLists?.dInitStrats ?? [] },
      oInitCollection: { items: dropdownLists?.oInitStrats ?? [] },
      dMainCollection: { items: dropdownLists?.dMainStrats ?? [] },
      oMainCollection: { items: dropdownLists?.oMainStrats ?? [] },
    }),
    [dropdownLists]
  );

  const typeCollection = { items: [...outcomeOptions] as string[] };
  const reasonCollection = { items: [...turnoverReasons] as string[] };
  const methodCollection = { items: [...scoreMethods] as string[] };

  const zoneCollection = useMemo(() => {
    const zones = Array.from({ length: 12 }, (_, i) => i + 1);
    return { items: zones };
  }, []);

  return {
    offenceCollection,
    defenceCollection,
    zoneCollection,
    methodCollection,
    reasonCollection,
    typeCollection,
    stratCollections,
  };
}
