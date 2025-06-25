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
  Center, Button, useDisclosure
} from "@chakra-ui/react";
import StandardHeader from "@/components/standard-header.tsx";
import {useParams } from "next/navigation";
import OnPageVideoLink from "@/components/on-page-video-link.tsx";
import {baseUrlToTimestampUrl} from "@/lib/utils.ts";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import { PlayerDetailed } from "@/app/players/supabase.ts";
import {AsyncDropdown} from "@/components/async-dropdown.tsx";
import ThrowCounter from "@/components/throws-input.tsx";
import { usePointFormData, usePointFormCollections } from "@/app/hooks/usePointFormData.ts";
import {AddPossession, schema} from "@/app/possessions/possessions.schema.ts";
import {usePossessionSubmit} from "@/app/hooks/usePermissionSubmit.ts";
import FloatingActionButton from "@/components/ui/floating-plus.tsx";
import {AddClipModal} from "@/app/clips/components/add-clip-modal.tsx";

function PossessionPageContent() {
  const { player } = useAuth();
  const { id, point_id } = useParams<{ id: string, point_id: string }>();

  const {
    handleSubmit,
    control,
    reset,
    watch,
    getValues,
    formState: { errors, isSubmitting, isValid },
  } = useForm<AddPossession>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });
  const { data, isLoading, error } = usePointFormData(point_id);
  if (error) throw error;
  const { point, possessions, dropdownLists } = data || {
    point: null,
    possessions: [],
    dropdownLists: {},
  };
  const { submitPossession } = usePossessionSubmit({
    point: point!,
    possessions: possessions!,
    onSuccess: () => {
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
    },
    eventId: id
  });
  const collections = usePointFormCollections(data);

  const possessionNumber = useMemo(() => {
    return (possessions?.length ?? 0) + 1;
  }, [possessions]);

  const selectedDefencePlayerIds = watch("defence_team_players");
  const selectedOffencePlayerIds = watch("offence_team_players");

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

  const watchedOutcome = watch("possession_outcome");

  const { open, onOpen, onClose } = useDisclosure();

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
          <Text color="white" fontSize="lg">No point data found</Text>
        </Box>
      )
    }

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
      <form onSubmit={handleSubmit(submitPossession)}>
        <AsyncDropdown
          name="offence_team_players"
          control={control}
          label="Offence Players"
          placeholder="Select players on offence"
          collection={collections.offenceCollection}
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
          collection={collections.defenceCollection}
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
            collection={collections.stratCollections.dInitCollection}
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
            collection={collections.stratCollections.dMainCollection}
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
            collection={collections.stratCollections.oInitCollection}
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
            collection={collections.stratCollections.oMainCollection}
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
          collection={collections.typeCollection}
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
                collection={collections.zoneCollection}
                isLoading={isLoading}
                itemToKey={(zoneNumber) => zoneNumber}
                renderItem={(zoneNumber) => `Zone ${zoneNumber}`}
              />
              <AsyncDropdown
                name="turn_receive_zone"
                control={control}
                label="Intended Receive Zone"
                placeholder="Select receive zone"
                collection={collections.zoneCollection}
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
                collection={collections.reasonCollection}
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
              collection={collections.methodCollection}
              isLoading={isLoading}
              itemToKey={(item) => item}
              renderItem={(item) => item}
            />
            <HStack mb={8} mt={8}>
              <Button type="submit" disabled={!isValid || isSubmitting}>
                Add Point
              </Button>
            </HStack>
          </>
        )}
      </form>
      <FloatingActionButton onClick={onOpen} iconType="clip" />
      <AddClipModal
        isOpen={open}
        onClose={onClose}
        eventId={id}
        sourceId = {point.source_id}
        playerId={player.player_id}
      />
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

