"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPoint } from "@/app/points/supabase";
import {fetchPointPossessions, PossessionDetailed} from "@/app/possessions/supabase";
import {getPlayersForTeam, PlayerDetailed} from "@/app/players/supabase";
import {fetchStrategiesByType, Strategy} from "@/app/strategies/supabase";
import {createListCollection} from "@chakra-ui/react";
import {useMemo} from "react";

const outcomeOptions = ["Turnover", "Score"] as const
const turnoverReasons = ["Drop", "Throw Away", "Block", "Stallout"] as const
const scoreMethods = ["Flow", "Deep Shot", "Endzone"] as const

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
    queryKey: ['pointPageData', point_id],
    queryFn: () => fetchPointPageData(point_id),
    enabled: !!point_id,
  });
}

export function usePointFormCollections(data: PointPageData | undefined) {
  const { dropdownLists } = data || {
    dropdownLists: {
      offencePlayers: [],
      defencePlayers: [],
      dInitStrats: [],
      oInitStrats: [],
      dMainStrats: [],
      oMainStrats: [],
    },
  };

  const offenceCollection = useMemo(() => {
    return createListCollection<PlayerDetailed>({
      items: dropdownLists?.offencePlayers ?? [],
      itemToString: (player) => player.player_name,
      itemToValue: (player) => player.player_id,
    });
  }, [dropdownLists]);

  const defenceCollection = useMemo(() => {
    return createListCollection<PlayerDetailed>({
      items: dropdownLists?.defencePlayers ?? [],
      itemToString: (player) => player.player_name,
      itemToValue: (player) => player.player_id,
    });
  }, [dropdownLists]);

  const stratCollections = useMemo(() => {
    const createStrategyCollection = (strats: Strategy[]) => {
      return createListCollection({
        items: strats,
        itemToString: (strat) => strat.strategy,
        itemToValue: (strat) => strat.strategy_id,
      });
    };

    return {
      dInitCollection: createStrategyCollection(dropdownLists?.dInitStrats ?? []),
      oInitCollection: createStrategyCollection(dropdownLists?.oInitStrats ?? []),
      dMainCollection: createStrategyCollection(dropdownLists?.dMainStrats ?? []),
      oMainCollection: createStrategyCollection(dropdownLists?.oMainStrats ?? []),
    };
  }, [dropdownLists]);

  const typeCollection = createListCollection({
    items: [...outcomeOptions],
    itemToString: (item) => item,
    itemToValue: (item) => item,
  })

  const reasonCollection = createListCollection({
    items: [...turnoverReasons],
    itemToString: (item) => item,
    itemToValue: (item) => item,
  })

  const methodCollection = createListCollection({
    items: [...scoreMethods],
    itemToString: (item) => item,
    itemToValue: (item) => item,
  })

  const zoneCollection = useMemo(() => {
    const zones = Array.from({ length: 12 }, (_, i) => i + 1);

    return createListCollection({
      items: zones,
      itemToValue: (zoneNumber) => String(zoneNumber),
      itemToString: (zoneNumber) => `Zone ${zoneNumber}`,
    });
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
