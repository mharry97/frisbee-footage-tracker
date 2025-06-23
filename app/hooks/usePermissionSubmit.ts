"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePointPlayers, PointDetailed } from "@/app/points/supabase";
import { addPossession, PossessionDetailed } from "@/app/possessions/supabase";
import {AddPossession, EditPossession} from "@/app/possessions/possessions.schema.ts";
import {useRouter} from "next/navigation";
import {supabase} from "@/lib/supabase.ts";

interface UsePossessionSubmitProps {
  point: PointDetailed;
  possessions: PossessionDetailed[];
  onSuccess?: () => void;
  eventId: string;
}

function createPossessionPayload(formData: EditPossession, isScore: boolean) {
  return {
    throws: formData.throws ?? null,
    offence_init: formData.offence_init?.[0] ?? null,
    defence_init: formData.defence_init?.[0] ?? null,
    offence_main: formData.offence_main?.[0] ?? null,
    defence_main: formData.defence_main?.[0] ?? null,

    // Turnover specific fields
    turnover_reason: !isScore ? formData.turnover_reason?.[0] ?? null : null,
    turn_throw_zone: !isScore ? Number(formData.turn_throw_zone?.[0]) ?? null : null,
    turn_receive_zone: !isScore ? Number(formData.turn_receive_zone?.[0]) ?? null : null,
    turn_thrower: !isScore ? formData.turn_thrower?.[0] ?? null : null,
    turn_intended_receiver: !isScore ? formData.turn_intended_receiver?.[0] ?? null : null,
    d_player: !isScore ? formData.d_player?.[0] ?? null : null,

    // Score specific fields
    score_method: isScore ? formData.score_method?.[0] ?? null : null,
    score_player: isScore ? formData.score_player?.[0] ?? null : null,
    assist_player: isScore ? formData.assist_player?.[0] ?? null : null,
  };
}

export function usePossessionSubmit({ point, possessions, onSuccess, eventId }: UsePossessionSubmitProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutateAsync: updatePointPlayersMutation, isPending: isUpdatingPlayers } = useMutation({
    mutationFn: updatePointPlayers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pointPageData"] });
    },
  });

  const { mutateAsync: addPossessionMutation, isPending: isAddingPossession } = useMutation({
    mutationFn: addPossession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pointPageData"] });
      onSuccess?.();
    },
  });

  const handleFormSubmit = async (formData: AddPossession) => {
    const playerPayload = {
      point_id: point.point_id,
      offence_team_players: formData.offence_team_players ?? [],
      defence_team_players: formData.defence_team_players ?? [],
    };
    // Payload for adding possession info
    const isScore = formData.possession_outcome?.[0] === "Score";
    const possession_number = (possessions?.length ?? 0) + 1;
    const possessionOffenceTeam = possession_number % 2 === 0 ? point.defence_team : point.offence_team;
    const possessionDefenceTeam = possession_number % 2 === 0 ? point.offence_team : point.defence_team;
    const sharedPayload = createPossessionPayload(formData, isScore);
    const finalPayload = {
      ...sharedPayload,
      point_id: point.point_id,
      possession_number,
      is_score: isScore,
      offence_team: possessionOffenceTeam,
      defence_team: possessionDefenceTeam,
    };
    await updatePointPlayersMutation(playerPayload);
    await addPossessionMutation(finalPayload);
    if (isScore) {
      router.push(`/events/${eventId}`);
    }
  };

  return {
    submitPossession: handleFormSubmit,
    isSubmitting: isUpdatingPlayers || isAddingPossession,
  };
}

type UpdatePossessionPayload = ReturnType<typeof createPossessionPayload>;
export function useEditPossessionSubmit({ onSuccess }: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  const { mutateAsync: updatePointPlayersMutation, isPending: isUpdatingPlayers } = useMutation({
    mutationFn: updatePointPlayers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pointPageData"] });
    },
  });

  const { mutateAsync: updatePossessionMutation, isPending: isUpdatingPossession } = useMutation({
    mutationFn: async (variables: { possession_id: string; payload: UpdatePossessionPayload }) => {
      const { error } = await supabase
        .from("possessions")
        .update(variables.payload)
        .eq("possession_id", variables.possession_id);

      if (error) {
        console.error("Error updating possession:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pointPageData"] });
      onSuccess?.();
    },
  });

  const handleEditSubmit = async (formData: EditPossession, possessionToEdit: PossessionDetailed) => {
    const payloadToUpdate = createPossessionPayload(formData, possessionToEdit.is_score);
    const playerPayload = {
      point_id: possessionToEdit.point_id,
      offence_team_players: formData.offence_team_players ?? [],
      defence_team_players: formData.defence_team_players ?? [],
    };
    await Promise.all([
      updatePointPlayersMutation(playerPayload),
      updatePossessionMutation({
        possession_id: possessionToEdit.possession_id,
        payload: payloadToUpdate,
      }),
    ]);
  };

  return {
    submitEdit: handleEditSubmit,
    isSubmitting: isUpdatingPlayers || isUpdatingPossession,
  };
}
