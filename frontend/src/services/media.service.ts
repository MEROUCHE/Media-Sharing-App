import api from "../api";
import type {
  MediaItem,
  CreateMediaItemPayload,
  MediaItemDetail,
  ExternalSearchResult,
} from "../types/media.types";

export async function getGroupMediaItems(
  groupId: string,
  type?: string,
): Promise<MediaItem[]> {
  const { data } = await api.get<{ data: MediaItem[] }>(
    `/groups/${groupId}/media`,
    {
      params: { type },
    },
  );
  return data.data;
}

export async function addMediaItem(
  groupId: string,
  payload: CreateMediaItemPayload,
): Promise<MediaItem> {
  const { data } = await api.post<MediaItem>(
    `/groups/${groupId}/media`,
    payload,
  );
  return data;
}

export async function getMediaItemDetails(
  groupId: string,
  mediaId: string,
): Promise<MediaItemDetail> {
  const { data } = await api.get<MediaItemDetail>(
    `/groups/${groupId}/media/${mediaId}`,
  );
  return data;
}

export async function removeMediaItem(
  groupId: string,
  mediaId: string,
): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(
    `/groups/${groupId}/media/${mediaId}`,
  );
  return data;
}

export async function searchExternalMedia(
  query: string,
  type: string,
): Promise<ExternalSearchResult[]> {
  const { data } = await api.get<ExternalSearchResult[]>("/media/search", {
    params: { query, type },
  });
  return data;
}

export async function getExternalMediaDetails(
  id: string,
  type: string,
): Promise<ExternalSearchResult> {
  const { data } = await api.get<ExternalSearchResult>("/media/search/details", {
    params: { id, type },
  });
  return data;
}
