import { z } from "zod";

export const outcomeOptions = ["Turnover", "Score"] as const
export const turnoverReasons = ["Drop", "Throw Away", "Block", "Stallout"] as const
export type TurnoverReasons = typeof turnoverReasons[number];
export const scoreMethods = ["Flow", "Deep Shot", "Endzone"] as const
export type ScoreMethods = typeof scoreMethods[number];

export const schema = z.object({
  offence_init: z.string().array().optional(),
  defence_init: z.string().array().optional(),
  offence_main: z.string().array().optional(),
  defence_main: z.string().array().optional(),
  throws: z.number(),
  turn_throw_zone: z.string().array().optional(),
  turn_receive_zone: z.string().array().optional(),
  turnover_reason: z.enum(turnoverReasons, {
    required_error: "Please select a turnover reason.",
  }).array().optional(),
  score_method: z.enum(scoreMethods, {
    required_error: "Please select a score method.",
  }).array().optional(),
  score_player: z.string().array().optional(),
  assist_player: z.string().array().optional(),
  turn_thrower: z.string().array().optional(),
  turn_intended_receiver: z.string().array().optional(),
  d_player: z.string().array().optional(),
  possession_outcome: z.enum(outcomeOptions, {
    required_error: "Please select a possession outcome.",
  }).array(),
  offence_team_players: z.string().array().optional(),
  defence_team_players: z.string().array().optional(),
});

export type AddPossession = z.infer<typeof schema>;
export const editSchema = schema.omit({
  possession_outcome: true,
});
export type EditPossession = Omit<AddPossession, "possession_outcome">
