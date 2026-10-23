import api from "../api";
import type { UserProfileResponse, UpdateUserPayload } from "../types/auth.types";

export async function getUserById(id: string): Promise<UserProfileResponse> {
  const { data } = await api.get<UserProfileResponse>(`/users/${id}`);
  return data;
}

export async function getAllUsers(): Promise<UserProfileResponse[]> {
  const { data } = await api.get<UserProfileResponse[]>("/users");
  return data;
}

export async function updateUser(
  id: string,
  payload: UpdateUserPayload,
): Promise<UserProfileResponse> {
  const { data } = await api.patch<UserProfileResponse>(`/users/${id}`, payload);
  return data;
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/users/${id}`);
}
