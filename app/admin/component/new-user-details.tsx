import { SubmitHandler, useForm } from "react-hook-form"
import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { getHomeTeam } from "@/app/teams/supabase.ts";
import { PasswordInput } from "@/components/ui/password-input.tsx";

const schema = z.object({
  player_name: z.string(),
  email: z.string().includes("@app.local", { message: "Email must include @app.local" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
})

type UserFormData = z.infer<typeof schema>

export default function NewUserDetailsPortal({ onSuccess }: { onSuccess: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(schema)
  })

  const onSubmit: SubmitHandler<UserFormData> = async (data) => {
    try {
      const teamId = await getHomeTeam();
      if (!teamId) {
        console.error("No home team found");
        return;
      }

      const res = await fetch("/api/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, team_id: teamId })
      })

      const result = await res.json()
      if (!res.ok) {
        console.error("Error creating user:", result.error)
        return;
      }

      console.log("User successfully created")
      onSuccess?.();
    } catch (err) {
      console.error("Unexpected error:", err)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">Player Name</label>
          <input
            {...register("player_name")}
            className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-neutral-100 text-sm focus:outline-none focus:border-neutral-500"
          />
          {errors.player_name && <p className="text-red-400 text-xs mt-1">{errors.player_name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">Email</label>
          <input
            {...register("email")}
            className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-neutral-100 text-sm focus:outline-none focus:border-neutral-500"
          />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email?.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">Password</label>
          <PasswordInput {...register("password")} />
          {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password?.message}</p>}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 rounded bg-neutral-700 hover:bg-neutral-600 text-sm transition-colors disabled:opacity-50"
        >
          Submit
        </button>
      </div>
    </form>
  )
}
