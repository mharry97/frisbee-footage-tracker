import React, { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from "zod";
import { Player } from "@/app/players/supabase.ts";
import { upsertPlayer } from "@/app/players/supabase.ts";
import { AsyncDropdown } from "@/components/async-dropdown.tsx";
import { fetchTeams } from "@/app/teams/supabase.ts";
import { CustomModal } from "@/components/modal";

const schema = z.object({
  player_name: z.string(),
  team_id: z.string().array(),
  number: z.coerce.number().optional(),
  is_active: z.boolean(),
  notes: z.string().optional(),
})

export type PlayerFormData = z.infer<typeof schema>

interface PlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  playerToEdit?: Player;
  teamId?: string;
  playerName?: string;
  playerNumber?: number;
}

export function PlayerModal({
  isOpen,
  onClose,
  mode,
  playerToEdit,
  teamId,
  playerName,
  playerNumber,
}: PlayerModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<PlayerFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      player_name: mode === 'edit' ? playerToEdit?.player_name : (playerName ?? ''),
      number: mode === 'edit' ? playerToEdit?.number : (playerNumber ?? undefined),
      is_active: mode === 'edit' ? playerToEdit?.is_active : true,
      team_id: mode === 'edit' ? [playerToEdit?.team_id] : (teamId ? [teamId] : []),
      notes: mode === 'edit' ? (playerToEdit?.notes ?? '') : '',
    },
  });

  const { data: teamsData, isLoading: isLoadingTeams } = useQuery({
    queryFn: fetchTeams,
    queryKey: ["editPlayerTeams"]
  });

  const teamCollection = useMemo(
    () => ({ items: teamsData ?? [] }),
    [teamsData]
  );

  const { mutateAsync: upsertPlayerMutation } = useMutation({
    mutationFn: upsertPlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['pointPageData'] });
      queryClient.invalidateQueries({ queryKey: ['player'] });
      reset();
      onClose();
    },
  });

  const onSubmit = (formData: PlayerFormData) => {
    upsertPlayerMutation({
      player_name: formData.player_name,
      number: formData.number || undefined,
      is_active: formData.is_active,
      notes: formData.notes || null,
      player_id: mode === 'edit' ? playerToEdit?.player_id : undefined,
      team_id: formData.team_id[0],
    });
  };

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} title={mode === 'edit' ? 'Edit Player' : 'Add New Player'} width="500px">
      <form id="player-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Player Name</label>
            <input
              {...register("player_name")}
              className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-neutral-100 text-sm focus:outline-none focus:border-neutral-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Number</label>
            <input
              type="number"
              {...register("number")}
              className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-neutral-100 text-sm focus:outline-none focus:border-neutral-500"
            />
          </div>
          <AsyncDropdown
            name="team_id"
            control={control}
            label="Team"
            placeholder="Select player's team"
            disabled={mode === 'edit'}
            collection={teamCollection}
            isLoading={isLoadingTeams}
            itemToKey={(item) => item.team_id}
            renderItem={(item) => item.team_name}
          />
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Notes</label>
            <textarea
              {...register("notes")}
              placeholder="Any notes on player"
              rows={3}
              className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-neutral-100 text-sm focus:outline-none focus:border-neutral-500 resize-none"
            />
          </div>
          <Controller
            control={control}
            name="is_active"
            render={({ field }) => (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="rounded border-neutral-700"
                />
                <span className="text-sm">Active?</span>
              </label>
            )}
          />
          <div className="flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded hover:bg-neutral-800 text-sm transition-colors text-neutral-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="player-form"
              disabled={isSubmitting}
              className="px-4 py-2 rounded bg-neutral-700 hover:bg-neutral-600 text-sm transition-colors disabled:opacity-50"
            >
              {mode === 'edit' ? 'Save Changes' : 'Create Player'}
            </button>
          </div>
        </div>
      </form>
    </CustomModal>
  );
}
