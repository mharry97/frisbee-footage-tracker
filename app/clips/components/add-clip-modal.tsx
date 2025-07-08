import React, { useMemo } from "react";
import {
  Dialog,
  Button,
  Portal,
  Field,
  Input,
  Textarea,
  createListCollection,
  Stack,
  Text,
  Checkbox
} from "@chakra-ui/react";
import { fetchVisiblePlaylists } from "@/app/playlists/supabase";
import {ClipDetail, upsertClip} from "@/app/clips/supabase";
import {AsyncDropdown} from "@/components/async-dropdown.tsx";
import {z} from "zod";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {fetchSources} from "@/app/sources/supabase.ts";
import {fetchPlayers} from "@/app/players/supabase.ts";
import {fetchTeams} from "@/app/teams/supabase.ts";

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
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
}

export function AddClipModal({ eventId,
                               sourceId,
                               playerId,
                               isOpen,
                               onClose,
                               playlists,
                               mode,
                               clipToEdit}: AddClipModalProps) {
  // console.log(sourceId);
  const {
    control,
    register,
    handleSubmit,
    setError,
    reset,
    formState: {errors, isSubmitting, isValid}} = useForm<AddClip>({ resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      title: mode === 'edit' ? clipToEdit?.title : '',
      source: mode === 'edit' ? [clipToEdit?.source_id] : (sourceId ? [sourceId] : []),
      timestamp: mode === 'edit' ? clipToEdit?.timestamp : '',
      description: mode === 'edit' ? clipToEdit?.description : '',
      playlists: mode === 'edit' ? clipToEdit?.playlists ?? [] : (playlists ? playlists : []),
      is_public: mode === 'edit' ? clipToEdit?.is_public : true,
    },
  });
  const queryClient = useQueryClient()

  // Fetch data for dropdowns

  // Playlists
  const { data: playlistsData, isLoading: isLoadingPlaylists } = useQuery({
    queryFn: () => fetchVisiblePlaylists(playerId),
    queryKey: ["playlists"]
  })

  // Sources

  const { data: sourcesData, isLoading: isLoadingSources } = useQuery({
    queryKey: ["sources"],
    queryFn: fetchSources,
  });

  // Players

  const { data: playersData, isLoading: isLoadingPlayers } = useQuery({
    queryKey: ["players"],
    queryFn: fetchPlayers,
  });

  // Teams

  const { data: teamsData, isLoading: isLoadingTeams } = useQuery({
    queryKey: ["teams"],
    queryFn: fetchTeams,
  });

  const isLoading = isLoadingSources || isLoadingPlaylists || isLoadingPlayers || isLoadingTeams;

  // Form collections for dropdowns

  const sourceCollection = useMemo(() =>
      createListCollection({
        items: sourcesData ?? [],
        itemToString: (item) => item.title,
        itemToValue: (item) => item.source_id,
      }),
    [sourcesData]
  );

  const playersCollection = useMemo(() =>
      createListCollection({
        items: playersData ?? [],
        itemToString: (item) => item.player_name,
        itemToValue: (item) => item.player_id,
      }),
    [playersData]
  );

  const teamsCollection = useMemo(() =>
      createListCollection({
        items: teamsData ?? [],
        itemToString: (item) => item.team_name,
        itemToValue: (item) => item.team_id,
      }),
    [teamsData]
  );

  const playlistCollection = useMemo(() =>
      createListCollection({
        items: playlistsData ?? [],
        itemToString: (item) => item.title,
        itemToValue: (item) => item.playlist_id,
      }),
    [playlistsData]
  );

  const { mutateAsync: upsertClipMutation } = useMutation({
    mutationFn: upsertClip,
    onSuccess: () => {queryClient.invalidateQueries({ queryKey: ["clips"] })}
  });

  const onSubmit = async (formData: AddClip) => {
    try {
      const clipPayload = {
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
      };

      await upsertClipMutation(clipPayload);
      await queryClient.invalidateQueries({ queryKey: ["clips", eventId] });
      reset();
      onClose();
    } catch (err) {
      setError("root", { message: err instanceof Error ? err.message : "Submission failed" });
    }
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => {
        if (!details.open) {
          onClose();
        }
      }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Dialog.Header>
                <Dialog.Title>
                  {mode==="edit" ? 'Edit Clip' : 'Add New Clip'}
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Field.Root mb={4}>
                  <Field.Label>Title</Field.Label>
                  <Input {...register("title", { required: "Title is required" })} />
                  {errors.title && (
                    <Field.ErrorText>{errors.title.message}</Field.ErrorText>
                  )}
                </Field.Root>
                <AsyncDropdown
                  name="source"
                  control={control}
                  label="Source"
                  placeholder="Select source"
                  collection={sourceCollection}
                  isLoading={isLoading}
                  itemToKey={(item) => item.source_id}
                  disabled={mode==="edit"}
                  renderItem={(item) => (
                    <Stack gap={0}>
                      <Text>{item.title}</Text>
                      <Text textStyle="xs" color="fg.muted">{item.url}</Text>
                    </Stack>
                  )}
                />
                <Field.Root mb={4}>
                  <Field.Label>Timestamp</Field.Label>
                  <Input {...register("timestamp", { required: "Timestamp is required" })} />
                  {errors.timestamp && (
                    <Field.ErrorText>{errors.timestamp.message}</Field.ErrorText>
                  )}
                </Field.Root>
                <Field.Root mb={4}>
                  <Field.Label>Description</Field.Label>
                  <Textarea
                    placeholder="Brief description"
                    {...register("description", { required: "Description is required" })}
                    size="xl"
                    variant="outline"
                  />
                  {errors.description && (
                    <Field.ErrorText>{errors.description.message}</Field.ErrorText>
                  )}
                </Field.Root>
                <AsyncDropdown
                  name="playlists"
                  control={control}
                  label="Playlist/s"
                  placeholder="Select playlist/s"
                  collection={playlistCollection}
                  isLoading={isLoading}
                  multiple={true}
                  itemToKey={(item) => item.playlist_id}
                  renderItem={(item) => (
                    <Stack gap={0}>
                      <Text>{item.title}</Text>
                      <Text textStyle="xs" color="fg.muted">{item.created_by_name}</Text>
                    </Stack>
                  )}
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
                  renderItem={(item) => (
                    <Stack gap={0}>
                      <Text>{item.player_name}</Text>
                      <Text textStyle="xs" color="fg.muted">{item.team_name}{item.number && ` - #${item.number}`}</Text>
                    </Stack>
                  )}
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
                  renderItem={(item) => (
                    <Stack gap={0}>
                      <Text>{item.team_name}</Text>
                    </Stack>
                  )}
                />
                <Controller
                  control={control}
                  name="is_public"
                  render={({ field }) => (
                    <Field.Root>
                      <Checkbox.Root
                        checked={field.value}
                        onCheckedChange={({ checked }) => field.onChange(checked)}
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control />
                        <Checkbox.Label>Public Clip?</Checkbox.Label>
                      </Checkbox.Root>
                    </Field.Root>
                  )}
                />
              </Dialog.Body>
              <Dialog.Footer display="flex" justifyContent="space-between">
                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={!isValid || isSubmitting}
                >
                  {mode === "edit" ? 'Update' : 'Add'}
                </Button>
                <Button variant="ghost" onClick={onClose} mt={4}>
                  Cancel
                </Button>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
