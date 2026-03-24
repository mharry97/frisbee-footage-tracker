import { HiLockClosed, HiShieldCheck, HiUser } from "react-icons/hi";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface EditUserDetailsPortalProps {
  onSuccess: () => void;
  defaultValues: {
    player_name: string;
    email: string;
    is_active: boolean;
    is_admin: boolean;
    is_editor: boolean;
  };
  playerId: string;
  auth_user_id: string;
}

const schema = z.object({
  player_name: z.string(),
  email: z.string().includes("@app.local", { message: "Email must include @app.local" }),
  is_active: z.boolean(),
  is_editor: z.boolean(),
  is_admin: z.boolean(),
});

type UserFormData = z.infer<typeof schema>;

const roleItems = [
  { key: "is_active" as const, icon: <HiLockClosed />, label: "Active", description: "Active account" },
  { key: "is_editor" as const, icon: <HiUser />, label: "Editor", description: "Can manage events" },
  { key: "is_admin" as const, icon: <HiShieldCheck />, label: "Admin", description: "Full access" },
];

export default function EditUserDetailsPortal({
  onSuccess,
  defaultValues,
  playerId,
  auth_user_id,
}: EditUserDetailsPortalProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const onSubmit: SubmitHandler<UserFormData> = async (data) => {
    try {
      await fetch("/api/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, player_id: playerId, auth_user_id }),
      });
      onSuccess?.();
    } catch (err) {
      console.error("Failed to update user:", err);
    }
  };

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
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {roleItems.map((item) => (
            <Controller
              key={item.key}
              control={control}
              name={item.key}
              render={({ field }) => (
                <label className={`flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-colors ${field.value ? "border-yellow-400 bg-yellow-400/10" : "border-neutral-700 hover:border-neutral-500"}`}>
                  <input
                    type="checkbox"
                    checked={!!field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="sr-only"
                  />
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-xs text-neutral-400 text-center">{item.description}</span>
                  {field.value && <span className="text-xs text-yellow-400">✓</span>}
                </label>
              )}
            />
          ))}
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
  );
}
