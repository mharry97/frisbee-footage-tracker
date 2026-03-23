import React, { useMemo } from "react";
import { fetchVisiblePlaylists } from "@/app/playlists/supabase";
import { ClipDetail, upsertClip } from "@/app/clips/supabase";
import { AsyncDropdown } from "@/components/async-dropdown.tsx";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchSources } from "@/app/sources/supabase.ts";
import { fetchPlayers } from "@/app/players/supabase.ts";
import { fetchTeams } from "@/app/teams/supabase.ts";
import { CustomModal } from "@/components/modal";

const schema = z.object({
  title: z.string(),
  source: z.string().array(),
  timestamp: z.string(),
  description: z.string(),
  playlists: z.string().array().optional(),
  is_public: z.boolean(),
  players: z.string().array().optional(),
  teams: z.string().array().optional(),
})

type AddClip = z.infer<typeof schema>

interface AddClipModalProps {
  eventId?: string;
  playerId: string;
  sourceId?: string;
  clipToEdit?: ClipDetail;
  playlists?: string[];
  players?: string[];
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
}

export function AddClipModal({
  eventId,
  sourceId,
  playerId,
  isOpen,
  onClose,
  playlists,
  players,
  mode,
  clipToEdit,
}: AddClipModalProps) {
  const {
    control,
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<AddClip>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      title: mode === 'edit' ? clipToEdit?.title : '',
      source: mode === 'edit' ? [clipToEdit?.source_id] : (sourceId ? [sourceId] : []),
      timestamp: mode === 'edit' ? clipToEdit?.timestamp : '',
      description: mode === 'edit' ? clipToEdit?.description : '',
      playlists: mode === 'edit' ? clipToEdit?.playlists ?? [] : (playlists ? playlists : []),
      is_public: mode === 'edit' ? clipToEdit?.is_public : true,
      players: mode === 'edit' ? clipToEdit?.players ?? [] : (players ? players : []),
    },
  });
  const queryClient = useQueryClient()

  const { data: playlistsData, isLoading: isLoadingPlaylists } = useQuery({
    queryFn: () => fetchVisiblePlaylists(playerId),
    queryKey: ["playlists"]
  });

  const { data: sourcesData, isLoading: isLoadingSources } = useQuery({
    queryKey: ["sources"],
    queryFn: fetchSources,
  });

  const { data: playersData, isLoading: isLoadingPlayers } = useQuery({
    queryKey: ["players"],
    queryFn: fetchPlayers,
  });

  const { data: teamsData, isLoading: isLoadingTeams } = useQuery({
    queryKey: ["teams"],
    queryFn: fetchTeams,
  });

  const isLoading = isLoadingSources || isLoadingPlaylists || isLoadingPlayers || isLoadingTeams;

  const sourceCollection = useMemo(() => ({ items: sourcesData ?? [] }), [sourcesData]);
  const playersCollection = useMemo(() => ({ items: playersData ?? [] }), [playersData]);
  const teamsCollection = useMemo(() => ({ items: teamsData ?? [] }), [teamsData]);
  const playlistCollection = useMemo(() => ({ items: playlistsData ?? [] }), [playlistsData]);

  const { mutateAsync: upsertClipMutation } = useMutation({
    mutationFn: upsertClip,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["clips"] }) }
  });

  const onSubmit = async (formData: AddClip) => {
    try {
      await upsertClipMutation({
        title: formData.title,
        source_id: formData.source[0],
        event_id: eventId ?? clipToEdit?.event_id ?? null,
        timestamp: formData.timestamp,
        description: formData.description,
        playlists: formData.playlists || [],
        is_public: formData.is_public,
        teams: formData.teams || [],
        players: formData.players || [],
        clip_id: clipToEdit?.clip_id ?? undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ["clips", eventId] });
      reset();
      onClose();
    } catch (err) {
      setError("root", { message: err instanceof Error ? err.message : "Submission failed" });
    }
  };

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} title={mode === "edit" ? "Edit Clip" : "Add New Clip"} width="600px">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-300 mb-1">Title</label>
          <input
            {...register("title", { required: "Title is required" })}
            className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-neutral-100 text-sm focus:outline-none focus:border-neutral-500"
          />
          {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
        </div>
        <AsyncDropdown
          name="source"
          control={control}
          label="Source"
          placeholder="Select source"
          collection={sourceCollection}
          isLoading={isLoading}
          itemToKey={(item) => item.source_id}
          disabled={mode === "edit"}
          renderItem={(item) => item.title}
        />
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-300 mb-1">Timestamp</label>
          <input
            {...register("timestamp", { required: "Timestamp is required" })}
            className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-neutral-100 text-sm focus:outline-none focus:border-neutral-500"
          />
          {errors.timestamp && <p className="text-red-400 text-xs mt-1">{errors.timestamp.message}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-300 mb-1">Description</label>
          <textarea
            {...register("description", { required: "Description is required" })}
            placeholder="Brief description"
            rows={3}
            className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-neutral-100 text-sm focus:outline-none focus:border-neutral-500 resize-none"
          />
          {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
        </div>
        <AsyncDropdown
          name="playlists"
          control={control}
          label="Playlist/s"
          placeholder="Select playlist/s"
          collection={playlistCollection}
          isLoading={isLoading}
          multiple={true}
          itemToKey={(item) => item.playlist_id}
          renderItem={(item) => item.title}
        />
        <AsyncDropdown
          name="players"
          control={control}
          label="Player/s"
          placeholder="Select player/s"
          collection={playersCollection}
          isLoading={isLoading}
          multiple={true}
          itemToKey={(item) => item.player_id}
          renderItem={(item) => item.player_name}
        />
        <AsyncDropdown
          name="teams"
          control={control}
          label="Team/s"
          placeholder="Team/s"
          collection={teamsCollection}
          isLoading={isLoading}
          multiple={true}
          itemToKey={(item) => item.team_id}
          renderItem={(item) => item.team_name}
        />
        <Controller
          control={control}
          name="is_public"
          render={({ field }) => (
            <label className="flex items-center gap-2 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                className="rounded border-neutral-700"
              />
              <span className="text-sm">Public Clip?</span>
            </label>
          )}
        />
        <div className="flex justify-between">
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="px-4 py-2 rounded bg-neutral-700 hover:bg-neutral-600 text-sm transition-colors disabled:opacity-50"
          >
            {mode === "edit" ? "Update" : "Add"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded hover:bg-neutral-800 text-sm transition-colors text-neutral-400"
          >
            Cancel
          </button>
        </div>
        {errors.root && <p className="text-red-400 text-xs mt-2">{errors.root.message}</p>}
      </form>
    </CustomModal>
  );
}
