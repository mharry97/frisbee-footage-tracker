import React, { useEffect, useMemo, useState } from "react";
import ThrowCounter from "@/components/throws-input";
import { usePointFormCollections, usePointFormData } from "@/app/hooks/usePointFormData.ts";
import { AsyncDropdown } from "@/components/async-dropdown.tsx";
import { Controller, useForm } from "react-hook-form";
import { EditPossession, editSchema } from "@/app/possessions/possessions.schema.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScoreMethods, TurnoverReasons } from "@/app/possessions/possessions.schema.ts";
import { useEditPossessionSubmit } from "@/app/hooks/usePermissionSubmit.ts";
import { PlayerDetailed } from "@/app/players/supabase.ts";
import AddPlayerButton from "@/components/ui/add-player-button.tsx";
import { PlayerModal } from "@/app/players/components/player-modal.tsx";
import { CustomModal } from "@/components/modal";

type EditPossessionDialogProps = {
  isOpen: boolean;
  possessionNumber: number;
  onClose: () => void;
  pointId: string;
};

export default function EditPossessionDialog({
  isOpen,
  possessionNumber,
  onClose,
  pointId,
}: EditPossessionDialogProps) {
  const [playerOpen, setPlayerOpen] = useState(false);
  const { data, isLoading, error } = usePointFormData(pointId);
  if (error) throw error;

  const { point, possessions, dropdownLists } = data || {
    point: null,
    possessions: [],
    dropdownLists: {},
  };
  const collections = usePointFormCollections(data);

  const possessionToEdit = useMemo(
    () => possessions.find(p => p.possession_number === possessionNumber),
    [possessions, possessionNumber]
  );

  const { control, handleSubmit, watch, reset, formState: { isSubmitting: isFormSubmitting } } =
    useForm<EditPossession>({
      resolver: zodResolver(editSchema),
      defaultValues: {
        offence_team_players: point?.offence_team_players ?? [],
        defence_team_players: point?.defence_team_players ?? [],
        defence_init: possessionToEdit?.defence_init ? [possessionToEdit.defence_init] : [],
        defence_main: possessionToEdit?.defence_main ? [possessionToEdit.defence_main] : [],
        offence_init: possessionToEdit?.offence_init ? [possessionToEdit.offence_init] : [],
        offence_main: possessionToEdit?.offence_main ? [possessionToEdit.offence_main] : [],
        throws: possessionToEdit?.throws ?? 0,
        turn_throw_zone: possessionToEdit?.turn_throw_zone ? [String(possessionToEdit.turn_throw_zone)] : [],
        turn_receive_zone: possessionToEdit?.turn_receive_zone ? [String(possessionToEdit.turn_receive_zone)] : [],
        turn_thrower: possessionToEdit?.turn_thrower ? [possessionToEdit.turn_thrower] : [],
        turn_intended_receiver: possessionToEdit?.turn_intended_receiver ? [possessionToEdit.turn_intended_receiver] : [],
        turnover_reason: possessionToEdit?.turnover_reason ? [possessionToEdit.turnover_reason as TurnoverReasons] : [],
        d_player: possessionToEdit?.d_player ? [possessionToEdit.d_player] : [],
        assist_player: possessionToEdit?.assist_player ? [possessionToEdit.assist_player] : [],
        score_player: possessionToEdit?.score_player ? [possessionToEdit.score_player] : [],
        score_method: possessionToEdit?.score_method ? [possessionToEdit.score_method as ScoreMethods] : [],
      },
    });

  useEffect(() => {
    if (possessionToEdit) {
      reset({
        offence_team_players: point?.offence_team_players ?? [],
        defence_team_players: point?.defence_team_players ?? [],
        defence_init: possessionToEdit.defence_init ? [possessionToEdit.defence_init] : [],
        defence_main: possessionToEdit.defence_main ? [possessionToEdit.defence_main] : [],
        offence_init: possessionToEdit.offence_init ? [possessionToEdit.offence_init] : [],
        offence_main: possessionToEdit.offence_main ? [possessionToEdit.offence_main] : [],
        throws: possessionToEdit.throws ?? 0,
        turn_throw_zone: possessionToEdit.turn_throw_zone ? [String(possessionToEdit.turn_throw_zone)] : [],
        turn_receive_zone: possessionToEdit.turn_receive_zone ? [String(possessionToEdit.turn_receive_zone)] : [],
        turn_thrower: possessionToEdit.turn_thrower ? [possessionToEdit.turn_thrower] : [],
        turn_intended_receiver: possessionToEdit.turn_intended_receiver ? [possessionToEdit.turn_intended_receiver] : [],
        turnover_reason: possessionToEdit.turnover_reason ? [possessionToEdit.turnover_reason as TurnoverReasons] : [],
        d_player: possessionToEdit.d_player ? [possessionToEdit.d_player] : [],
        assist_player: possessionToEdit.assist_player ? [possessionToEdit.assist_player] : [],
        score_player: possessionToEdit.score_player ? [possessionToEdit.score_player] : [],
        score_method: possessionToEdit.score_method ? [possessionToEdit.score_method as ScoreMethods] : [],
      });
    }
  }, [possessionToEdit, reset, point]);

  const { submitEdit, isSubmitting: isMutationSubmitting } = useEditPossessionSubmit({ onSuccess: onClose });
  const isSubmitting = isFormSubmitting || isMutationSubmitting;

  const onSubmit = (formData: EditPossession) => {
    if (!possessionToEdit) return;
    submitEdit(formData, possessionToEdit);
  };

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
    return isPointDefenceTeamOnOffence
      ? { activeOffenceCollection: availableOnDefenceCollection, activeDefenceCollection: availableOnOffenceCollection }
      : { activeOffenceCollection: availableOnOffenceCollection, activeDefenceCollection: availableOnDefenceCollection };
  }, [possessionNumber, availableOnOffenceCollection, availableOnDefenceCollection]);

  if (isLoading) return null;
  if (!possessionToEdit) return null;

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} title="Edit Possession" width="600px">
      <form id="edit-possession-form" onSubmit={handleSubmit(onSubmit)}>
        <p className="text-lg mb-4">Players</p>
        <AsyncDropdown name="offence_team_players" control={control} label="Point Offence Players"
          placeholder="Select players on offence" collection={collections.offenceCollection}
          isLoading={isLoading} multiple={true} itemToKey={(item) => item.player_id}
          renderItem={(item) => item.player_name}
        />
        <AsyncDropdown name="defence_team_players" control={control} label="Point Defence Players"
          placeholder="Select players on defence" collection={collections.defenceCollection}
          isLoading={isLoading} multiple={true} itemToKey={(item) => item.player_id}
          renderItem={(item) => item.player_name}
        />
        <AddPlayerButton onClick={() => setPlayerOpen(true)} />
        <PlayerModal isOpen={playerOpen} onClose={() => setPlayerOpen(false)} mode="add" />

        <p className="text-lg mb-4 mt-4">Plays</p>
        <div className="grid grid-cols-2 gap-4">
          <AsyncDropdown name="defence_init" control={control} label="Defence Initiation"
            placeholder="Select defence initiation" collection={collections.stratCollections.dInitCollection}
            isLoading={isLoading} itemToKey={(item) => item.strategy_id}
            renderItem={(item) => item.strategy}
          />
          <AsyncDropdown name="defence_main" control={control} label="Defence Main"
            placeholder="Select defence main play" collection={collections.stratCollections.dMainCollection}
            isLoading={isLoading} itemToKey={(item) => item.strategy_id}
            renderItem={(item) => item.strategy}
          />
          <AsyncDropdown name="offence_init" control={control} label="Offence Initiation"
            placeholder="Select offence initiation" collection={collections.stratCollections.oInitCollection}
            isLoading={isLoading} itemToKey={(item) => item.strategy_id}
            renderItem={(item) => item.strategy}
          />
          <AsyncDropdown name="offence_main" control={control} label="Offence Main"
            placeholder="Select offence main play" collection={collections.stratCollections.oMainCollection}
            isLoading={isLoading} itemToKey={(item) => item.strategy_id}
            renderItem={(item) => item.strategy}
          />
        </div>
        <Controller name="throws" control={control} defaultValue={0}
          render={({ field }) => <ThrowCounter value={field.value} onChange={field.onChange} />}
        />

        {possessionToEdit.is_score === false && (
          <>
            <p className="text-lg mb-4 mt-4">Turnover Details</p>
            <img src="/pitch-zoned.png" className="mb-4" alt="Pitch Zoned" />
            <div className="grid grid-cols-2 gap-4">
              <AsyncDropdown name="turn_throw_zone" control={control} label="Thrown From"
                placeholder="Select throw zone" collection={collections.zoneCollection}
                isLoading={isLoading} itemToKey={(n) => n}
                renderItem={(n) => `Zone ${n}`}
              />
              <AsyncDropdown name="turn_receive_zone" control={control} label="Intended Receive Zone"
                placeholder="Select receive zone" collection={collections.zoneCollection}
                isLoading={isLoading} itemToKey={(n) => n}
                renderItem={(n) => `Zone ${n}`}
              />
              <AsyncDropdown name="turn_thrower" control={control} label="Thrower"
                placeholder="Select thrower" collection={activeOffenceCollection}
                isLoading={isLoading} itemToKey={(item) => item.player_id}
                renderItem={(item) => item.player_name}
              />
              <AsyncDropdown name="turn_intended_receiver" control={control} label="Intended Receiver"
                placeholder="Select intended receiver" collection={activeOffenceCollection}
                isLoading={isLoading} itemToKey={(item) => item.player_id}
                renderItem={(item) => item.player_name}
              />
              <AsyncDropdown name="turnover_reason" control={control} label="Turnover Reason"
                placeholder="Select reason" collection={collections.reasonCollection}
                isLoading={isLoading} itemToKey={(item) => item}
                renderItem={(item) => item}
              />
              <AsyncDropdown name="d_player" control={control} label="D Player"
                placeholder="Select D player" collection={activeDefenceCollection}
                isLoading={isLoading} itemToKey={(item) => item.player_id}
                renderItem={(item) => item.player_name}
              />
            </div>
          </>
        )}

        {possessionToEdit.is_score === true && (
          <>
            <p className="text-lg mb-4 mt-4">Score Details</p>
            <AsyncDropdown name="assist_player" control={control} label="Assist Thrower"
              placeholder="Select assist thrower" collection={activeOffenceCollection}
              isLoading={isLoading} itemToKey={(item) => item.player_id}
              renderItem={(item) => item.player_name}
            />
            <AsyncDropdown name="score_player" control={control} label="Scorer"
              placeholder="Select scorer" collection={activeOffenceCollection}
              isLoading={isLoading} itemToKey={(item) => item.player_id}
              renderItem={(item) => item.player_name}
            />
            <AsyncDropdown name="score_method" control={control} label="Score Method"
              placeholder="Select score method" collection={collections.methodCollection}
              isLoading={isLoading} itemToKey={(item) => item}
              renderItem={(item) => item}
            />
          </>
        )}

        <div className="flex justify-between mt-4">
          <button
            type="submit"
            form="edit-possession-form"
            disabled={isSubmitting}
            className="px-4 py-2 rounded bg-neutral-700 hover:bg-neutral-600 text-sm transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Updating..." : "Update Possession"}
          </button>
        </div>
      </form>
    </CustomModal>
  );
}
