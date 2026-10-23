import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginPayloadValues = z.infer<typeof loginSchema>;
export type RegisterPayloadValues = z.infer<typeof registerSchema>;
export type ForgotPasswordPayloadValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordPayloadValues = z.infer<typeof resetPasswordSchema>;
