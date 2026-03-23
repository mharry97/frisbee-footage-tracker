import { z } from 'zod'
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import React, { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { addEvent, editEvent, EventDetail } from "@/app/events/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAsync } from "react-use";
import { fetchTeams } from "@/app/teams/supabase.ts";
import FloatingActionButton from "@/components/ui/floating-plus.tsx";
import { CustomModal } from "@/components/modal";

interface PortalProps {
  mode: "add" | "edit";
  currentData?: EventDetail;
  onSuccess?: () => void;
}

const game_types = z.enum(["Game", "Training"])

const schema = z.object({
  event_name: z.string(),
  event_date: z.string(),
  type: game_types.array(),
  teams: z.string().array().max(2, { message: "You can select a maximum of 2 teams." }),
  notes: z.string().optional(),
});

type EventData = z.infer<typeof schema>;

const EventForm = ({ mode, currentData }: PortalProps) => {
  const [open, setOpen] = useState(false)
  const state = useAsync(fetchTeams)

  const teamsCollection = useMemo(
    () => ({ items: state.value ?? [] }),
    [state.value]
  );

  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    setError,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EventData>({
    resolver: zodResolver(schema),
    defaultValues: currentData
      ? {
          event_name: currentData.event_name,
          event_date: currentData.event_date?.split("T")[0] || "",
          type: currentData.type ? [currentData.type] : [],
          teams: [currentData.team_1_id, currentData.team_2_id],
          notes: currentData.notes,
        }
      : { event_name: "", event_date: "", type: [], teams: [], notes: "" },
  })

  const { mutateAsync: addEventMutation } = useMutation({
    mutationFn: addEvent,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["events"] }); setOpen(false); }
  })

  const { mutateAsync: editEventMutation } = useMutation({
    mutationFn: editEvent,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["events"] }); setOpen(false); }
  })

  const handleOpen = () => { reset(); setOpen(true); }
  const gameType = watch("type");
  const isGameFieldsDisabled = gameType?.[0] !== "Game";

  const onSubmit: SubmitHandler<EventData> = async (data) => {
    const payload = {
      ...data,
      type: data.type[0],
      team_1_id: data.teams[0],
      team_2_id: data.teams[1],
    };
    try {
      if (mode === "add") {
        await addEventMutation(payload);
      } else {
        await editEventMutation({ ...payload, event_id: currentData!.event_id });
      }
    } catch (error) {
      setError("root", {
        message: error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }

  return (
    <>
      {mode === "add" ? (
        <FloatingActionButton onClick={handleOpen} iconType="add" />
      ) : (
        <button
          onClick={handleOpen}
          className="px-3 py-1.5 rounded hover:bg-neutral-800 text-sm transition-colors text-neutral-400"
        >
          Edit
        </button>
      )}
      <CustomModal isOpen={open} onClose={() => setOpen(false)} title={mode === "add" ? "New Event" : "Edit Event"} width="500px">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Game Type</label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <select
                    disabled={mode === "edit"}
                    value={field.value?.[0] ?? ""}
                    onChange={(e) => field.onChange(e.target.value ? [e.target.value] : [])}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-neutral-100 text-sm focus:outline-none disabled:opacity-50"
                  >
                    <option value="">Select game type</option>
                    <option value="Game">Game</option>
                    <option value="Training">Training</option>
                  </select>
                )}
              />
              {errors.type && <p className="text-red-400 text-xs mt-1">{errors.type.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Event Name</label>
              <input
                {...register("event_name")}
                disabled={isGameFieldsDisabled}
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-neutral-100 text-sm focus:outline-none disabled:opacity-50"
              />
              {errors.event_name && <p className="text-red-400 text-xs mt-1">{errors.event_name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Event Date</label>
              <input
                {...register("event_date")}
                type="date"
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-neutral-100 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Teams</label>
              <Controller
                control={control}
                name="teams"
                render={({ field }) => (
                  <select
                    multiple
                    disabled={mode === "edit" || isGameFieldsDisabled}
                    value={field.value ?? []}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
                      field.onChange(selected);
                    }}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-neutral-100 text-sm focus:outline-none disabled:opacity-50"
                    size={Math.min(4, teamsCollection.items.length + 1)}
                  >
                    {teamsCollection.items.map((team) => (
                      <option key={team.team_id} value={team.team_id}>
                        {team.team_name}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.teams && <p className="text-red-400 text-xs mt-1">{errors.teams.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Notes</label>
              <textarea
                {...register("notes")}
                placeholder="Any notes on the event"
                rows={3}
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-neutral-100 text-sm focus:outline-none resize-none"
              />
            </div>
            <div className="flex justify-between">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded bg-neutral-700 hover:bg-neutral-600 text-sm transition-colors disabled:opacity-50"
              >
                {mode === "add" ? "Add" : "Update"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded hover:bg-neutral-800 text-sm transition-colors text-neutral-400"
              >
                Cancel
              </button>
            </div>
            {errors.root && <p className="text-red-400 text-xs mt-2">{errors.root.message}</p>}
          </div>
        </form>
      </CustomModal>
    </>
  )
}

export default EventForm;
