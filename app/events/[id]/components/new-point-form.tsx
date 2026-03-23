import { z } from 'zod'
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import React, { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { addPoint } from "@/app/points/supabase";
import FloatingActionButton from "@/components/ui/floating-plus.tsx";
import { useAsync } from "react-use";
import { fetchSources } from "@/app/sources/supabase.ts";
import { fetchEventTeams, fetchEventTeamsInfo } from "@/app/events/[id]/supabase.ts";
import { useRouter } from "next/navigation";
import { CustomModal } from "@/components/modal";

interface PortalProps {
  event_id: string;
}

const schema = z.object({
  source_id: z.string().array().nonempty({ message: "Please select a source." }),
  timestamp: z.string().min(1, { message: "Timestamp is required." }),
  offence_team: z.string().array().min(1, { message: "Please select an offence team." }),
});

type PointData = z.infer<typeof schema>;

const PointForm = ({ event_id }: PortalProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<PointData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  })

  const sourceState = useAsync(fetchSources)

  const teamsState = useAsync(async () => {
    if (!event_id) return [];
    const teamIds = await fetchEventTeams(event_id);
    if (teamIds.length === 0) return [];
    return await fetchEventTeamsInfo(teamIds);
  }, [event_id]);

  const selectedOffenceTeamId = watch("offence_team")?.[0];
  const defenceTeam = useMemo(() => {
    if (!selectedOffenceTeamId || !teamsState.value) return undefined;
    return teamsState.value.find((team) => team.team_id !== selectedOffenceTeamId);
  }, [selectedOffenceTeamId, teamsState.value]);

  const handleOpenPortal = () => { reset(); setOpen(true); }

  const onSubmit: SubmitHandler<PointData> = async (data) => {
    const defence_team_id = defenceTeam?.team_id;
    if (!defence_team_id) {
      setError("root", { message: "Could not determine the defence team." });
      return;
    }
    try {
      const point_id = await addPoint({
        ...data,
        source_id: data.source_id[0],
        offence_team: data.offence_team[0],
        event_id,
        defence_team: defence_team_id,
      });
      router.push(`/events/${event_id}/${point_id}`);
    } catch (error) {
      setError("root", {
        message: error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }

  return (
    <>
      <FloatingActionButton onClick={handleOpenPortal} iconType="add" />
      <CustomModal isOpen={open} onClose={() => setOpen(false)} title="Add Point" width="500px">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Source</label>
              <Controller
                name="source_id"
                control={control}
                render={({ field }) => (
                  <select
                    value={field.value?.[0] ?? ""}
                    onChange={(e) => field.onChange(e.target.value ? [e.target.value] : [])}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-neutral-100 text-sm focus:outline-none"
                  >
                    <option value="">Select point source</option>
                    {(sourceState.value ?? []).map((source) => (
                      <option key={source.source_id} value={source.source_id}>
                        {source.title}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.source_id && <p className="text-red-400 text-xs mt-1">{errors.source_id.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Timestamp</label>
              <input
                {...register("timestamp")}
                placeholder="Enter timestamp"
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-neutral-100 text-sm focus:outline-none"
              />
              {errors.timestamp && <p className="text-red-400 text-xs mt-1">{errors.timestamp.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Offence Team</label>
              <Controller
                name="offence_team"
                control={control}
                render={({ field }) => (
                  <select
                    value={field.value?.[0] ?? ""}
                    onChange={(e) => field.onChange(e.target.value ? [e.target.value] : [])}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-neutral-100 text-sm focus:outline-none"
                  >
                    <option value="">Select team on offence</option>
                    {(teamsState.value ?? []).map((team) => (
                      <option key={team.team_id} value={team.team_id}>
                        {team.team_name}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.offence_team && <p className="text-red-400 text-xs mt-1">{errors.offence_team.message}</p>}
            </div>
            <div className="flex justify-between">
              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="px-4 py-2 rounded bg-neutral-700 hover:bg-neutral-600 text-sm transition-colors disabled:opacity-50"
              >
                Add
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

export default PointForm;
