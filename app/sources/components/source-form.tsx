import {z} from 'zod'
import {SubmitHandler, useForm} from "react-hook-form";
import React, { useState } from "react";
import {zodResolver} from "@hookform/resolvers/zod";
import {addSource, editSource, Source} from "@/app/sources/supabase";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import FloatingActionButton from "@/components/ui/floating-plus.tsx";
import { CustomModal } from "@/components/modal";

interface PortalProps {
  mode: "add" | "edit";
  currentSourceData?: Source;
  onSuccess?: () => void;
}

const schema = z.object({
  title: z.string(),
  url: z.string(),
  recorded_date: z.string(),
});

type SourceData = z.infer<typeof schema>;

const SourceForm = ({ mode, currentSourceData }: PortalProps) => {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    formState: {errors, isSubmitting}} = useForm<SourceData>({
    resolver:zodResolver(schema),
    defaultValues: currentSourceData
      ? {
        ...currentSourceData,
        recorded_date: currentSourceData.recorded_date?.split("T")[0] || "",
      }
      : {
        title: "",
        url: "",
        recorded_date: "",
      },
  })

  const { mutateAsync: addSourceMutation } = useMutation({
    mutationFn: addSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources"] })
      setOpen(false);
    }
  })

  const { mutateAsync: editSourceMutation } = useMutation({
    mutationFn: editSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources"] })
      setOpen(false);
    }
  })

  const onSubmit: SubmitHandler<SourceData> = async (data) => {
    try {
      if (mode === "add") {
        await addSourceMutation(data);
      } else {
        await editSourceMutation({ ...data, source_id: currentSourceData!.source_id });
      }
    } catch (error) {
      setError("root", {
        message: error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }

  const inputClass = "w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-neutral-100 text-sm focus:outline-none focus:border-neutral-500";
  const labelClass = "block text-sm font-medium text-neutral-300 mb-1";

  return (
    <>
      {mode === "add"
        ? <FloatingActionButton onClick={() => setOpen(true)} iconType="add"/>
        : <button
            onClick={() => setOpen(true)}
            className="px-3 py-1.5 rounded bg-transparent hover:bg-neutral-700 text-sm transition-colors"
          >
            Edit
          </button>
      }
      <CustomModal isOpen={open} onClose={() => setOpen(false)} title={mode === "add" ? "New Source" : "Edit Source"}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4">
            <div>
              <label className={labelClass}>Title</label>
              <input className={inputClass} {...register("title")} />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className={labelClass}>URL</label>
              <input className={inputClass} {...register("url")} />
              {errors.url && <p className="text-red-400 text-xs mt-1">{errors.url.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Recorded Date</label>
              <input className={inputClass} {...register("recorded_date")} type="date" />
              {errors.recorded_date && <p className="text-red-400 text-xs mt-1">{errors.recorded_date.message}</p>}
            </div>
          </div>
          <div className="flex justify-between items-center mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded bg-yellow-600 hover:bg-yellow-500 text-white text-sm transition-colors disabled:opacity-50"
            >
              {mode === "add" ? "Add" : "Update"}
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

export default SourceForm;
