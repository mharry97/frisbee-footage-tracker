import React from "react";
import {
  Dialog,
  Button,
  Portal,
  Field,
  Input,
  Textarea,
  Checkbox
} from "@chakra-ui/react";
import { addPlaylist } from "@/app/playlists/supabase";
import {z} from "zod";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useMutation, useQueryClient} from "@tanstack/react-query";

const schema = z.object({
  title: z.string(),
  description: z.string(),
  is_public: z.boolean()
})

type AddPlaylist = z.infer<typeof schema>

interface AddPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddPlaylistModal({ isOpen, onClose }: AddPlaylistModalProps) {
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: {errors, isSubmitting, isValid}} = useForm<AddPlaylist>({ resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      title: "",
      description: "",
      is_public: true
    },
  });
  const queryClient = useQueryClient()

  const { mutateAsync: addPlaylistMutation } = useMutation({
    mutationFn: addPlaylist,
  });

  const onSubmit = async (formData: AddPlaylist) => {
    try {
      const playlistPayload = {
        title: formData.title,
        description: formData.description,
        is_public: formData.is_public,
      };

      await addPlaylistMutation(playlistPayload);
      await queryClient.invalidateQueries({ queryKey: ["playlists"] });
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
                <Dialog.Title>Add Playlist</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Field.Root mb={4}>
                  <Field.Label>Title</Field.Label>
                  <Input {...register("title", { required: "Title is required" })} />
                  {errors.title && (
                    <Field.ErrorText>{errors.title.message}</Field.ErrorText>
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
                        <Checkbox.Label>Public Playlist?</Checkbox.Label>
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
                  Add Playlist
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
