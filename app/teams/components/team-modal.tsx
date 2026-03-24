import React, { useState } from "react";
import FloatingActionButton from "@/components/ui/floating-plus.tsx";
import {SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {addTeam} from "@/app/teams/supabase.ts";
import { CustomModal } from "@/components/modal";

const schema = z.object({
  team_name: z.string(),
})

type TeamData = z.infer<typeof schema>

export default function TeamModal() {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: {errors, isSubmitting}} = useForm<TeamData>({ resolver: zodResolver(schema) })
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const { mutateAsync: addTeamMutation } = useMutation({
    mutationFn: addTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] })
      setOpen(false);
    }
  })

  const onSubmit: SubmitHandler<TeamData> = async (data) => {
    try {
      await addTeamMutation(data);
    } catch (error) {
      setError("root", {
        message: error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }

  return (
    <>
      <FloatingActionButton onClick={() => { reset({ team_name: "" }); setOpen(true); }} iconType="add"/>
      <CustomModal isOpen={open} onClose={() => setOpen(false)} title="New Team">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-300 mb-1">Team Name</label>
            <input
              className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-neutral-100 text-sm focus:outline-none focus:border-neutral-500"
              {...register("team_name")}
            />
            {errors.team_name && (
              <p className="text-red-400 text-xs mt-1">{errors.team_name.message}</p>
            )}
          </div>
          <div className="flex justify-between items-center mt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded bg-neutral-700 hover:bg-neutral-600 text-sm transition-colors disabled:opacity-50"
            >
              Add Team
            </button>
            {errors.root && <p className="text-red-400 text-sm">{errors.root.message}</p>}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded bg-transparent hover:bg-neutral-700 text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </CustomModal>
    </>
  )
}
