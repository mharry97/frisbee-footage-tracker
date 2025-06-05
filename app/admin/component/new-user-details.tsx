import {Container, Input, Field, Button, VStack} from "@chakra-ui/react";
import {SubmitHandler, useForm} from "react-hook-form"
import React from "react";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {getHomeTeam} from "@/app/teams/supabase.ts";
import {PasswordInput} from "@/components/ui/password-input.tsx";

// Form constants
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
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...data,
          team_id: teamId,
        })
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
    <Container>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack gap={4}>
          <Field.Root>
            <Field.Label>Player Name</Field.Label>
            <Input {...register("player_name")} />
            {errors.player_name && (<Field.ErrorText>{errors.player_name.message}</Field.ErrorText>)}
          </Field.Root>
          <Field.Root>
            <Field.Label>Email</Field.Label>
            <Input {...register("email")} />
            {errors.email && (<Field.ErrorText>{errors.email?.message}</Field.ErrorText>)}
          </Field.Root>
          <Field.Root>
            <Field.Label>Password</Field.Label>
            <PasswordInput {...register("password")} />
            {errors.password && (<Field.ErrorText>{errors.password?.message}</Field.ErrorText>)}
          </Field.Root>
          <Button type="submit" disabled={isSubmitting}>Submit</Button>
          </VStack>
      </form>
    </Container>
  )
}
