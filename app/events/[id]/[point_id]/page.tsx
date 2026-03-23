"use client"

import {useAuth} from "@/lib/auth-context.tsx";
import {AuthWrapper} from "@/components/auth-wrapper.tsx";
import React, {useMemo, useState} from "react";
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
import {PlayerModal} from "@/app/players/components/player-modal.tsx";
import AddPlayerButton from "@/components/ui/add-player-button.tsx"

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 mb-4 mt-4">
      <hr className="flex-1 border-neutral-700" />
      <span className="text-xl shrink-0">{label}</span>
      <hr className="flex-1 border-neutral-700" />
    </div>
  );
}

function PossessionPageContent() {
  const { player } = useAuth();
  const { id, point_id } = useParams<{ id: string, point_id: string }>();
  const [clipOpen, setClipOpen] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);

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
    defaultValues: {
      throws: 0,
      possession_outcome: [],
      offence_team_players: [],
      defence_team_players: [],
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
    },
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
        offence_team_players: offence_team_players,
        defence_team_players: defence_team_players,
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
    if (selectedIds.size === 0) return { items: [] as PlayerDetailed[] };
    return { items: allDefencePlayers.filter((p) => selectedIds.has(p.player_id)) };
  }, [selectedDefencePlayerIds, dropdownLists?.defencePlayers]);

  const availableOnOffenceCollection = useMemo(() => {
    const allOffencePlayers = dropdownLists?.offencePlayers ?? [];
    const selectedIds = new Set(selectedOffencePlayerIds ?? []);
    if (selectedIds.size === 0) return { items: [] as PlayerDetailed[] };
    return { items: allOffencePlayers.filter((p) => selectedIds.has(p.player_id)) };
  }, [selectedOffencePlayerIds, dropdownLists?.offencePlayers]);

  const { activeOffenceCollection, activeDefenceCollection } = useMemo(() => {
    const isPointDefenceTeamOnOffence = possessionNumber % 2 === 0;
    if (isPointDefenceTeamOnOffence) {
      return {
        activeOffenceCollection: availableOnDefenceCollection,
        activeDefenceCollection: availableOnOffenceCollection,
      };
    }
    return {
      activeOffenceCollection: availableOnOffenceCollection,
      activeDefenceCollection: availableOnDefenceCollection,
    };
  }, [possessionNumber, availableOnOffenceCollection, availableOnDefenceCollection]);

  const currentOffenceTeam = useMemo(() => {
    if (!point) return null;
    const nextPossessionNumber = (possessions?.length ?? 0) + 1;
    if (nextPossessionNumber % 2 === 0) {
      return { id: point.defence_team, name: point.defence_team_name };
    }
    return { id: point.offence_team, name: point.offence_team_name };
  }, [possessions, point]);

  const watchedOutcome = watch("possession_outcome");

  if (!player || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading point data...</p>
      </div>
    );
  }

  if (!point || !possessions) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">No point data found</p>
      </div>
    );
  }

  const playerRenderItem = (item: PlayerDetailed) =>
    `${item.player_name}${item.number ? ` (#${item.number})` : ""}`;

  return (
    <div className="py-8">
      <StandardHeader text={point.event_name} />
      <p className="mt-4 text-lg text-neutral-400 mb-4">{`${point.offence_team_name} on O starting ${point.timestamp}`}</p>
      <OnPageVideoLink url={baseUrlToTimestampUrl(point.base_url, point.timestamp)}/>

      <form onSubmit={handleSubmit(submitPossession)}>
        <SectionDivider label="Players" />

        <AsyncDropdown
          name="offence_team_players"
          control={control}
          label="Offence Players"
          placeholder="Select players on offence"
          collection={collections.offenceCollection}
          isLoading={isLoading}
          multiple={true}
          itemToKey={(item) => item.player_id}
          renderItem={playerRenderItem}
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
          renderItem={playerRenderItem}
        />
        <AddPlayerButton onClick={() => setPlayerOpen(true)} />
        <PlayerModal
          isOpen={playerOpen}
          onClose={() => setPlayerOpen(false)}
          mode="add"
        />

        <SectionDivider label={`Possession #${(possessions.length ?? 0) + 1}`} />

        <p className="text-lg mb-4 text-neutral-400">{`Offence: ${currentOffenceTeam?.name}`}</p>

        <div className="grid grid-cols-2 gap-4">
          <AsyncDropdown
            name="defence_init"
            control={control}
            label="Defence Initiation"
            placeholder="Select defence initiation"
            collection={collections.stratCollections.dInitCollection}
            isLoading={isLoading}
            itemToKey={(item) => item.strategy_id}
            renderItem={(item) => item.strategy}
          />
          <AsyncDropdown
            name="defence_main"
            control={control}
            label="Defence Main"
            placeholder="Select defence main play"
            collection={collections.stratCollections.dMainCollection}
            isLoading={isLoading}
            itemToKey={(item) => item.strategy_id}
            renderItem={(item) => item.strategy}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <AsyncDropdown
            name="offence_init"
            control={control}
            label="Offence Initiation"
            placeholder="Select offence initiation"
            collection={collections.stratCollections.oInitCollection}
            isLoading={isLoading}
            itemToKey={(item) => item.strategy_id}
            renderItem={(item) => item.strategy}
          />
          <AsyncDropdown
            name="offence_main"
            control={control}
            label="Offence Main"
            placeholder="Select offence main play"
            collection={collections.stratCollections.oMainCollection}
            isLoading={isLoading}
            itemToKey={(item) => item.strategy_id}
            renderItem={(item) => item.strategy}
          />
        </div>

        <Controller
          name="throws"
          control={control}
          defaultValue={0}
          render={({ field }) => (
            <ThrowCounter value={field.value} onChange={field.onChange} />
          )}
        />
        {errors.throws && (
          <p className="text-red-400 text-xs mt-1">{errors.throws.message}</p>
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

        {watchedOutcome?.[0] === "Turnover" && (
          <>
            <SectionDivider label="Turnover Info" />
            <div className="flex justify-center mb-4">
              <img src="/pitch-zoned.png" alt="Pitch Zoned" className="max-w-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <AsyncDropdown
                name="turn_thrower"
                control={control}
                label="Thrower"
                placeholder="Select thrower"
                collection={activeOffenceCollection}
                isLoading={isLoading}
                itemToKey={(item) => item.player_id}
                renderItem={playerRenderItem}
              />
              <AsyncDropdown
                name="turn_intended_receiver"
                control={control}
                label="Intended Receiver"
                placeholder="Select intended receiver"
                collection={activeOffenceCollection}
                isLoading={isLoading}
                itemToKey={(item) => item.player_id}
                renderItem={playerRenderItem}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                renderItem={playerRenderItem}
              />
            </div>
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="mt-8 mb-8 px-6 py-2 rounded bg-yellow-600 hover:bg-yellow-500 text-white font-medium transition-colors disabled:opacity-50"
            >
              Add Possession
            </button>
          </>
        )}

        {watchedOutcome?.[0] === "Score" && (
          <>
            <SectionDivider label="Score Info" />
            <AsyncDropdown
              name="assist_player"
              control={control}
              label="Assist Thrower"
              placeholder="Select assist thrower"
              collection={activeOffenceCollection}
              isLoading={isLoading}
              itemToKey={(item) => item.player_id}
              renderItem={playerRenderItem}
            />
            <AsyncDropdown
              name="score_player"
              control={control}
              label="Scorer"
              placeholder="Select scorer"
              collection={activeOffenceCollection}
              isLoading={isLoading}
              itemToKey={(item) => item.player_id}
              renderItem={playerRenderItem}
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
            <div className="mt-8 mb-8">
              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="px-6 py-2 rounded bg-green-700 hover:bg-green-600 text-white font-medium transition-colors disabled:opacity-50"
              >
                Add Point
              </button>
            </div>
          </>
        )}
      </form>

      <FloatingActionButton onClick={() => setClipOpen(true)} iconType="clip" />
      <AddClipModal
        isOpen={clipOpen}
        onClose={() => setClipOpen(false)}
        eventId={id}
        sourceId={point.source_id}
        playerId={player.player_id}
        mode="add"
      />
    </div>
  );
}

export default function PossessionPage() {
  return (
    <AuthWrapper>
      <PossessionPageContent />
    </AuthWrapper>
  )
}
