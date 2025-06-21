"use client"

import {useAuth} from "@/lib/auth-context.tsx";
import {AuthWrapper} from "@/components/auth-wrapper.tsx";
import React, {useMemo} from "react";
import {
  Box,
  Container,
  createListCollection,
  Field,
  HStack,
  Separator,
  Stack,
  Text,
  Image,
  Center, Button
} from "@chakra-ui/react";
import StandardHeader from "@/components/standard-header.tsx";
import {useParams} from "next/navigation";
import {fetchPoint, updatePointPlayers} from "@/app/points/supabase.ts";
import { Strategy } from "@/app/strategies/supabase"
import OnPageVideoLink from "@/components/on-page-video-link.tsx";
import {baseUrlToTimestampUrl} from "@/lib/utils.ts";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {addPossession, fetchPointPossessions} from "@/app/possessions/supabase.ts";
import {Controller, SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {isValid, z} from "zod";
import {getPlayersForTeam, PlayerDetailed} from "@/app/players/supabase.ts";
import {fetchStrategiesByType} from "@/app/strategies/supabase.ts";
import {AsyncDropdown} from "@/components/async-dropdown.tsx";
import ThrowCounter from "@/components/throws-input.tsx";

const outcomeOptions = ["Turnover", "Score"] as const
const turnoverReasons = ["Drop", "Throw Away", "Block", "Stallout"] as const
const scoreMethods = ["Flow", "Deep Shot", "Endzone"] as const


const schema = z.object({
  offence_init: z.string().array().optional(),
  defence_init: z.string().array().optional(),
  offence_main: z.string().array().optional(),
  defence_main: z.string().array().optional(),
  throws: z.number(),
  turn_throw_zone: z.coerce.number().array().optional(),
  turn_receive_zone: z.coerce.number().array().optional(),
  turnover_reason: z.enum(turnoverReasons, {
    required_error: "Please select a turnover reason.",
  }).array().optional(),
  score_method: z.enum(scoreMethods, {
    required_error: "Please select a score method.",
  }).array().optional(),
  score_player: z.string().array().optional(),
  assist_player: z.string().array().optional(),
  turn_thrower: z.string().array().optional(),
  turn_intended_receiver: z.string().array().optional(),
  d_player: z.string().array().optional(),
  possession_outcome: z.enum(outcomeOptions, {
    required_error: "Please select a possession outcome.",
  }).array(),
  offence_team_players: z.string().array().optional(),
  defence_team_players: z.string().array().optional(),
});

type AddPossession = z.infer<typeof schema>;

function PossessionPageContent() {
  const {player} = useAuth()
  const { point_id } = useParams<{ event_id: string, point_id: string }>();
  const queryClient = useQueryClient()
  const {
    handleSubmit,
    setError,
    control,
    reset,
    watch,
    getValues,
    formState: {errors, isSubmitting}} = useForm<AddPossession>({
    resolver:zodResolver(schema),
  })


  const {
    data,
    isLoading,
  } = useQuery({
    queryKey: ['pointPageData', point_id],
    queryFn: async () => {
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
        oMainStrats
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
        possessions: possessionsData,
        dropdownLists: {
          offencePlayers,
          defencePlayers,
          dInitStrats,
          oInitStrats,
          dMainStrats,
          oMainStrats,
        },
      };
    },
    enabled: !!point_id,
  });

  const { point, possessions, dropdownLists } = data || {
    point: null,
    possessions: [],
    dropdownLists: {},
  };

  const possessionNumber = useMemo(() => {
    return (possessions?.length ?? 0) + 1;
  }, [possessions]);

  const offenceCollection = useMemo(() => {
    return createListCollection({
      items: dropdownLists?.offencePlayers ?? [],
      itemToString: (player) => player.player_name,
      itemToValue: (player) => player.player_id,
    })
  }, [dropdownLists])
  const selectedOffencePlayerIds = watch("offence_team_players");



  const defenceCollection = useMemo(() => {
    return createListCollection({
      items: dropdownLists?.defencePlayers ?? [],
      itemToString: (player) => player.player_name,
      itemToValue: (player) => player.player_id,
    })
  }, [dropdownLists])
  const selectedDefencePlayerIds = watch("defence_team_players");

  const availableOnDefenceCollection = useMemo(() => {
    const allDefencePlayers = dropdownLists?.defencePlayers ?? [];
    const selectedIds = new Set(selectedDefencePlayerIds ?? []);

    if (selectedIds.size === 0) {
      return createListCollection<PlayerDetailed>({ items: [] });
    }

    const availablePlayers = allDefencePlayers.filter((player) =>
      selectedIds.has(player.player_id)
    );

    return createListCollection({
      items: availablePlayers,
      itemToString: (player) => player.player_name,
      itemToValue: (player) => player.player_id,
    });
  }, [selectedDefencePlayerIds, dropdownLists?.defencePlayers]);

  const availableOnOffenceCollection = useMemo(() => {
    const allOffencePlayers = dropdownLists?.offencePlayers ?? [];
    const selectedIds = new Set(selectedOffencePlayerIds ?? []);

    if (selectedIds.size === 0) {
      return createListCollection<PlayerDetailed>({ items: [] });
    }

    const availablePlayers = allOffencePlayers.filter((player) =>
      selectedIds.has(player.player_id)
    );

    return createListCollection({
      items: availablePlayers,
      itemToString: (player) => player.player_name,
      itemToValue: (player) => player.player_id,
    });
  }, [selectedOffencePlayerIds, dropdownLists?.offencePlayers]);

  const { activeOffenceCollection, activeDefenceCollection } = useMemo(() => {
    const isPointDefenceTeamOnOffence = possessionNumber % 2 === 0;

    if (isPointDefenceTeamOnOffence) {
      return {
        activeOffenceCollection: availableOnDefenceCollection,
        activeDefenceCollection: availableOnOffenceCollection,
      };
    } else {
      // The O-line is still on Offence
      return {
        activeOffenceCollection: availableOnOffenceCollection,
        activeDefenceCollection: availableOnDefenceCollection,
      };
    }
  }, [possessionNumber, availableOnOffenceCollection, availableOnDefenceCollection]);

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

  const watchedOutcome = watch("possession_outcome");

  const zoneCollection = useMemo(() => {
    const zones = Array.from({ length: 12 }, (_, i) => i + 1);

    return createListCollection({
      items: zones,
      itemToValue: (zoneNumber) => String(zoneNumber),
      itemToString: (zoneNumber) => `Zone ${zoneNumber}`,
    });
  }, []);


  const { mutateAsync: addPossessionMutation } = useMutation({
    mutationFn: addPossession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pointPageData"] })
      const { offence_team_players, defence_team_players } = getValues();
      reset({
        // Keep selected players
        offence_team_players: offence_team_players,
        defence_team_players: defence_team_players,
        // Reset everything else
        possession_outcome: [],
        throws: 0,
        offence_init: [],
        defence_init: [],
        offence_main: [],
        defence_main: [],
        turn_throw_zone: [],
        turn_receive_zone: [],
        turnover_reason: [],
        score_method: [],
        score_player: [],
        assist_player: [],
        turn_thrower: [],
        turn_intended_receiver: [],
        d_player: [],
      });
    }
  })

  const { mutateAsync: updatePointPlayersMutation } = useMutation({
    mutationFn: updatePointPlayers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pointPageData"] })
    }
  })

  if (!player || isLoading) {
    return (
      <Box minH="100vh" p={4} display="flex" alignItems="center" justifyContent="center">
        <Text color="white" fontSize="lg">Loading point data...</Text>
      </Box>
    );
  }

    if (!point || !possessions) {
      return (
        <Box minH="100vh" p={4} display="flex" alignItems="center" justifyContent="center">
          <Text color="white" fontSize="lg">Loading point data...</Text>
        </Box>
      )
    }

// This function will be wrapped by React Hook Form's handleSubmit
  const onSubmit: SubmitHandler<AddPossession> = async (formData) => {
    if (!point) return;

    try {
      // Payload for updating point players
      const playerPayload = {
        point_id: point.point_id,
        offence_team_players: formData.offence_team_players ?? [],
        defence_team_players: formData.defence_team_players ?? [],
      };
      await updatePointPlayersMutation(playerPayload);

      // Payload for adding possession info
      const isScore = formData.possession_outcome?.[0] === "Score";
      const possession_number = (possessions?.length ?? 0) + 1;
      const possessionOffenceTeam = possession_number % 2 === 0 ? point.defence_team : point.offence_team;
      const possessionDefenceTeam = possession_number % 2 === 0 ? point.offence_team : point.defence_team;
      const possessionPayload = {
        point_id: point.point_id,
        possession_number: (possessions?.length ?? 0) + 1,
        is_score: isScore,
        throws: formData.throws ?? null,
        offence_init: formData.offence_init?.[0] ?? null,
        defence_init: formData.defence_init?.[0] ?? null,
        offence_main: formData.offence_main?.[0] ?? null,
        defence_main: formData.defence_main?.[0] ?? null,

        offence_team: possessionOffenceTeam,
        defence_team: possessionDefenceTeam,
        turnover_reason: !isScore ? formData.turnover_reason?.[0] ?? null : null,
        turn_throw_zone: !isScore ? formData.turn_throw_zone?.[0] ?? null : null,
        turn_receive_zone: !isScore ? formData.turn_receive_zone?.[0] ?? null : null,
        turn_thrower: !isScore ? formData.turn_thrower?.[0] ?? null : null,
        turn_intended_receiver: !isScore ? formData.turn_intended_receiver?.[0] ?? null : null,
        d_player: !isScore ? formData.d_player?.[0] ?? null : null,

        score_method: isScore ? formData.score_method?.[0] ?? null : null,
        score_player: isScore ? formData.score_player?.[0] ?? null : null,
        assist_player: isScore ? formData.assist_player?.[0] ?? null : null,
      };

      await addPossessionMutation(possessionPayload);
    } catch (error) {
      console.error("Submission failed", error);
      setError("root", {
        message: error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  return (
    <Container maxW="4xl">
      <StandardHeader text={point.event_name} is_admin={player.is_admin} />
      <Text mt={4} fontSize="lg" color="gray.400" mb={4}>{`${point.offence_team_name} on O starting ${point.timestamp}`}</Text>
      <OnPageVideoLink url={baseUrlToTimestampUrl(point.base_url, point.timestamp)}/>
      <HStack mb={4} mt={4}>
        <Separator flex="1" size="sm"></Separator>
        <Text flexShrink="0" fontSize="xl">Players</Text>
        <Separator flex="1" size="sm"></Separator>
      </HStack>
      <form onSubmit={handleSubmit(onSubmit)}>
        <AsyncDropdown
          name="offence_team_players"
          control={control}
          label="Offence Players"
          placeholder="Select players on offence"
          collection={offenceCollection}
          isLoading={isLoading}
          multiple={true}
          itemToKey={(item) => item.player_id}
          renderItem={(item) => (
            <Stack gap={0}>
              <Text>{item.player_name}</Text>
              <Text textStyle="xs" color="fg.muted">{item.number ? "#"+item.number+" - " : ""}{item.is_active ? "Active" : "Inactive"}</Text>
            </Stack>
          )}
        />
        <AsyncDropdown
          name="defence_team_players"
          control={control}
          label="Defence Players"
          placeholder="Select players on defence"
          collection={defenceCollection}
          isLoading={isLoading}
          multiple={true}
          itemToKey={(item) => item.player_id}
          renderItem={(item) => (
            <Stack gap={0}>
              <Text>{item.player_name}</Text>
              <Text textStyle="xs" color="fg.muted">{item.number ? "#"+item.number+" - " : ""}{item.is_active ? "Active" : "Inactive"}</Text>
            </Stack>
          )}
        />
        <HStack mb={4} mt={4}>
          <Separator flex="1" size="sm"></Separator>
          <Text flexShrink="0" fontSize="2xl">{`Possession #${(possessions.length ?? 0) +1}`}</Text>
          <Separator flex="1" size="sm"></Separator>
        </HStack>
        <Text textStyle="xl" mb={4} color="gray.400">{`Offence: ${point.offence_team_name}`}</Text>
        <HStack>
          <AsyncDropdown
            name="defence_init"
            control={control}
            label="Defence Initiation"
            placeholder="Select defence initiation"
            collection={stratCollections.dInitCollection}
            isLoading={isLoading}
            itemToKey={(item) => item.strategy_id}
            renderItem={(item) => (
              <Stack gap={0}>
                <Text>{item.strategy}</Text>
                <Text color="fg.muted" fontSize="xs">
                  {item.strategy_type}
                </Text>
              </Stack>
            )}
          />
          <AsyncDropdown
            name="defence_main"
            control={control}
            label="Defence Main"
            placeholder="Select defence main play"
            collection={stratCollections.dMainCollection}
            isLoading={isLoading}
            itemToKey={(item) => item.strategy_id}
            renderItem={(item) => (
              <Stack gap={0}>
                <Text>{item.strategy}</Text>
                <Text color="fg.muted" fontSize="xs">
                  {item.strategy_type}
                </Text>
              </Stack>
            )}
          />
        </HStack>
        <HStack>
          <AsyncDropdown
            name="offence_init"
            control={control}
            label="Offence Initiation"
            placeholder="Select offence initiation"
            collection={stratCollections.oInitCollection}
            isLoading={isLoading}
            itemToKey={(item) => item.strategy_id}
            renderItem={(item) => (
              <Stack gap={0}>
                <Text>{item.strategy}</Text>
                <Text color="fg.muted" fontSize="xs">
                  {item.strategy_type}
                </Text>
              </Stack>
            )}
          />
          <AsyncDropdown
            name="offence_main"
            control={control}
            label="Offence Main"
            placeholder="Select offence main play"
            collection={stratCollections.oMainCollection}
            isLoading={isLoading}
            itemToKey={(item) => item.strategy_id}
            renderItem={(item) => (
              <Stack gap={0}>
                <Text>{item.strategy}</Text>
                <Text color="fg.muted" fontSize="xs">
                  {item.strategy_type}
                </Text>
              </Stack>
            )}
          />
        </HStack>
        <Controller
          name="throws"
          control={control}
          defaultValue={0}
          render={({ field }) => (
            <ThrowCounter
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        {errors.throws && (
          <Field.ErrorText>{errors.throws.message}</Field.ErrorText>
        )}
        <AsyncDropdown
          name="possession_outcome"
          control={control}
          label="Possession Outcome"
          placeholder="Select possession outcome"
          collection={typeCollection}
          isLoading={isLoading}
          itemToKey={(item) => item}
          renderItem={(item) => item}
        />
        <Box width="100%" height="10px">

        </Box>
        {watchedOutcome?.[0] === "Turnover" && (
          <>
            <HStack mb={4} mt={4}>
              <Separator flex="1" size="sm"></Separator>
              <Text flexShrink="0" fontSize="xl">Turnover Info</Text>
              <Separator flex="1" size="sm"></Separator>
            </HStack>
            <Center>
              <Image src="/pitch-zoned.png" mb={4} alt="Pitch Zoned" />
            </Center>
            <HStack>
              <AsyncDropdown
                name="turn_throw_zone"
                control={control}
                label="Thrown From"
                placeholder="Select throw zone"
                collection={zoneCollection}
                isLoading={isLoading}
                itemToKey={(zoneNumber) => zoneNumber}
                renderItem={(zoneNumber) => `Zone ${zoneNumber}`}
              />
              <AsyncDropdown
                name="turn_receive_zone"
                control={control}
                label="Intended Receive Zone"
                placeholder="Select receive zone"
                collection={zoneCollection}
                isLoading={isLoading}
                itemToKey={(zoneNumber) => zoneNumber}
                renderItem={(zoneNumber) => `Zone ${zoneNumber}`}
              />
            </HStack>
            <HStack>
              <AsyncDropdown
                name="turn_thrower"
                control={control}
                label="Thrower"
                placeholder="Select thrower"
                collection={activeOffenceCollection}
                isLoading={isLoading}
                itemToKey={(item) => item.player_id}
                renderItem={(item) => (
                  <Stack gap={0}>
                    <Text>{item.player_name}</Text>
                    <Text textStyle="xs" color="fg.muted">{item.number ? "#"+item.number+" - " : ""}{item.is_active ? "Active" : "Inactive"}</Text>
                  </Stack>
                )}
              />
              <AsyncDropdown
                name="turn_intended_receiver"
                control={control}
                label="Intended Receiver"
                placeholder="Select intended receiver"
                collection={activeOffenceCollection}
                isLoading={isLoading}
                itemToKey={(item) => item.player_id}
                renderItem={(item) => (
                  <Stack gap={0}>
                    <Text>{item.player_name}</Text>
                    <Text textStyle="xs"
                          color="fg.muted">{item.number ? "#" + item.number + " - " : ""}{item.is_active ? "Active" : "Inactive"}</Text>
                  </Stack>
                )}
              />
            </HStack>
            <HStack>
              <AsyncDropdown
                name="turnover_reason"
                control={control}
                label="Turnover Reason"
                placeholder="Select reason"
                collection={reasonCollection}
                isLoading={isLoading}
                itemToKey={(item) => item}
                renderItem={(item) => item}
              />
              <AsyncDropdown
                name="d_player"
                control={control}
                label="D player"
                placeholder="Select D player"
                collection={activeDefenceCollection}
                isLoading={isLoading}
                itemToKey={(item) => item.player_id}
                renderItem={(item) => (
                  <Stack gap={0}>
                    <Text>{item.player_name}</Text>
                    <Text textStyle="xs"
                          color="fg.muted">{item.number ? "#" + item.number + " - " : ""}{item.is_active ? "Active" : "Inactive"}</Text>
                  </Stack>
                )}
              />
            </HStack>
            <Button type="submit" disabled={!isValid || isSubmitting} mt={8} mb={8}>
              Add Possession
            </Button>
          </>
        )}
        {watchedOutcome?.[0] === "Score" && (
          <>
            <HStack mb={4} mt={4}>
              <Separator flex="1" size="sm"></Separator>
              <Text flexShrink="0" fontSize="xl">Score Info</Text>
              <Separator flex="1" size="sm"></Separator>
            </HStack>
            <AsyncDropdown
              name="assist_player"
              control={control}
              label="Assist Thrower"
              placeholder="Select assist thrower"
              collection={activeOffenceCollection}
              isLoading={isLoading}
              itemToKey={(item) => item.player_id}
              renderItem={(item) => (
                <Stack gap={0}>
                  <Text>{item.player_name}</Text>
                  <Text textStyle="xs" color="fg.muted">{item.number ? "#"+item.number+" - " : ""}{item.is_active ? "Active" : "Inactive"}</Text>
                </Stack>
              )}
            />
            <AsyncDropdown
              name="score_player"
              control={control}
              label="Scorer"
              placeholder="Select scorer"
              collection={activeOffenceCollection}
              isLoading={isLoading}
              itemToKey={(item) => item.player_id}
              renderItem={(item) => (
                <Stack gap={0}>
                  <Text>{item.player_name}</Text>
                  <Text textStyle="xs" color="fg.muted">{item.number ? "#"+item.number+" - " : ""}{item.is_active ? "Active" : "Inactive"}</Text>
                </Stack>
              )}
            />
            <AsyncDropdown
              name="score_method"
              control={control}
              label="Score Method"
              placeholder="Select score method"
              collection={methodCollection}
              isLoading={isLoading}
              itemToKey={(item) => item}
              renderItem={(item) => item}
            />
            <HStack mb={8} mt={8}>
              <Button type="submit" disabled={!isValid || isSubmitting}>
                Add Point
              </Button>
              <Button type="submit" disabled={!isValid || isSubmitting}>
                Add & Create New Point
              </Button>
            </HStack>
          </>
        )}
      </form>
    </Container>
  )

}

export default function PossessionPage() {
  return (
    <AuthWrapper>
      <PossessionPageContent />
    </AuthWrapper>
  )
}

