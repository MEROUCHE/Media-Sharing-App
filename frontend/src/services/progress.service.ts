import api from "../api";
import type {
  AllProgressResponse,
  UpsertProgressPayload,
  ProgressResponse,
  ProgressDetailResponse,
} from "../types/progress.types";

export async function getAllProgress(
  groupId: string,
  mediaId: string,
): Promise<AllProgressResponse> {
  const { data } = await api.get<AllProgressResponse>(
    `/groups/${groupId}/media/${mediaId}/progress`,
  );
  return data;
}

export async function upsertProgress(
  groupId: string,
  mediaId: string,
  payload: UpsertProgressPayload,
): Promise<ProgressResponse> {
  const { data } = await api.post<ProgressResponse>(
    `/groups/${groupId}/media/${mediaId}/progress`,
    payload,
  );
  return data;
}

export async function getUserProgress(
  groupId: string,
  mediaId: string,
  userId: string,
): Promise<ProgressDetailResponse> {
  const { data } = await api.get<ProgressDetailResponse>(
    `/groups/${groupId}/media/${mediaId}/progress/${userId}`,
  );
  return data;
}
