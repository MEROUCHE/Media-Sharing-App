import { z } from "zod";

export const loginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export const registerSchema = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string(),
});

export type LoginPayloadValues = z.infer<typeof loginSchema>;
export type RegisterPayloadValues = z.infer<typeof registerSchema>;
