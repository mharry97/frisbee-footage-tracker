import React, { useMemo } from "react";
import {
  Dialog,
  Button,
  Portal,
  Field,
  Input,
  Textarea,
  createListCollection, Stack, Text, Checkbox
} from "@chakra-ui/react";
import { fetchVisiblePlaylists } from "@/app/playlists/supabase";
import { addClip } from "@/app/clips/supabase";
import {AsyncDropdown} from "@/components/async-dropdown.tsx";
import {z} from "zod";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {fetchSources} from "@/app/sources/supabase.ts";

const schema = z.object({
  title: z.string(),
  source: z.string().array(),
  timestamp: z.string(),
  description: z.string(),
  playlists: z.string().array().optional(),
  is_public: z.boolean()
})

type AddClip = z.infer<typeof schema>

interface AddClipModalProps {
  eventId?: string;
  playerId: string;
  sourceId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AddClipModal({ eventId, sourceId, playerId, isOpen, onClose }: AddClipModalProps) {
  // console.log(sourceId);
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: {errors, isSubmitting, isValid}} = useForm<AddClip>({ resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      title: "",
      source: [sourceId],
      timestamp: "",
      description: "",
      playlists: [],
      is_public: true
    },
  });
  const queryClient = useQueryClient()

  const { data: playlistsData, isLoading: isLoadingPlaylists } = useQuery({
    queryFn: () => fetchVisiblePlaylists(playerId),
    queryKey: ["playlists"]
  })

  const { data: sourcesData, isLoading: isLoadingSources } = useQuery({
    queryKey: ["sources"],
    queryFn: fetchSources,
  });

  const isLoading = isLoadingSources || isLoadingPlaylists;

  const sourceCollection = useMemo(() =>
      createListCollection({
        items: sourcesData ?? [],
        itemToString: (item) => item.title,
        itemToValue: (item) => item.source_id,
      }),
    [sourcesData]
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
    mutationFn: addClip,
  });

  const onSubmit = async (formData: AddClip) => {
    try {
      const clipPayload = {
        title: formData.title,
        source_id: formData.source[0],
        event_id: eventId || null,
        timestamp: formData.timestamp,
        description: formData.description,
        playlists: formData.playlists || null,
        is_public: formData.is_public,
      };

      await upsertClipMutation(clipPayload);
      await queryClient.invalidateQueries({ queryKey: ["clips", eventId] });
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
                <Dialog.Title>Add Clip</Dialog.Title>
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
                  Add Clip
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
