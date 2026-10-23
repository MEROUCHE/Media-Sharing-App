import api from "../api";
import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from "../types/auth.types";

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", payload);
  return data;
}

export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  const { data } = await api.post<RegisterResponse>("/users/register", payload);
  return data;
}

export async function logout(refreshToken: string): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>("/auth/logout", {
    refreshToken,
  });
  return data;
}

export async function verifyEmail(token: string): Promise<{ message: string }> {
  const { data } = await api.get<{ message: string }>("/auth/verify-email", {
    params: { token },
  });
  return data;
}

export async function forgotPassword(
  payload: ForgotPasswordPayload,
): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(
    "/auth/forgot-password",
    payload,
  );
  return data;
}

export async function resetPassword(
  payload: ResetPasswordPayload,
): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(
    "/auth/reset-password",
    payload,
  );
  return data;
}
