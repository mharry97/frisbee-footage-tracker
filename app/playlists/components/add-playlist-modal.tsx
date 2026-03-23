import React from "react";
import { addPlaylist } from "@/app/playlists/supabase";
import {z} from "zod";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import { CustomModal } from "@/components/modal";

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
      await addPlaylistMutation({
        title: formData.title,
        description: formData.description,
        is_public: formData.is_public,
      });
      await queryClient.invalidateQueries({ queryKey: ["playlists"] });
      onClose();
    } catch (err) {
      setError("root", { message: err instanceof Error ? err.message : "Submission failed" });
    }
  };

  const inputClass = "w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-neutral-100 text-sm focus:outline-none focus:border-neutral-500";
  const labelClass = "block text-sm font-medium text-neutral-300 mb-1";

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} title="Add Playlist">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className={labelClass}>Title</label>
          <input className={inputClass} {...register("title", { required: "Title is required" })} />
          {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div className="mb-4">
          <label className={labelClass}>Description</label>
          <textarea
            className={inputClass + " resize-none h-24"}
            placeholder="Brief description"
            {...register("description", { required: "Description is required" })}
          />
          {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
        </div>

        <Controller
          control={control}
          name="is_public"
          render={({ field }) => (
            <div className="mb-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="is_public"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                className="w-4 h-4 accent-yellow-400"
              />
              <label htmlFor="is_public" className="text-sm text-neutral-300">Public Playlist?</label>
            </div>
          )}
        />

        <div className="flex justify-between mt-4">
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="px-4 py-2 rounded bg-yellow-600 hover:bg-yellow-500 text-white text-sm transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Adding..." : "Add Playlist"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-transparent hover:bg-neutral-700 text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </CustomModal>
  );
}
