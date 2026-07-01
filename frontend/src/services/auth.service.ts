import api from "../api";
import type { AuthResponse, LoginPayload, RegisterPayload } from "../types/auth.types";

export async function login(logins: LoginPayload) {
  const { data } = await api.post<AuthResponse>("/auth/login", logins);
  return data;
}

export async function register(logins: RegisterPayload) {
  const { data } = await api.post<AuthResponse>("/auth/register", logins);
  return data;
}

export function logout() {
  return api.post("/auth/logout");
}
