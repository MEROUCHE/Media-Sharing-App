export type MediaType = "BOOK" | "MOVIE" | "SHOW" | "GAME";

export interface MediaItem {
  id: string;
  type: string;
  title: string;
  creator: string | null;
  coverUrl: string | null;
  totalUnits: number | null;
  description: string | null;
  addedBy: string | null;
  addedAt: string;
}

export interface CreateMediaItemPayload {
  type: MediaType;
  title: string;
  creator?: string;
  coverUrl?: string;
  totalUnits?: number | null;
  description?: string;
}

export interface MemberProgressSummary {
  userId: string;
  username: string;
  avatarUrl: string | null;
  currentUnit: number;
  percentage: number | null;
  status: "not_started" | "in_progress" | "finished" | string;
  note: string | null;
  updatedAt: string;
}

export interface MediaItemDetail {
  id: string;
  type: string;
  title: string;
  creator: string | null;
  coverUrl: string | null;
  totalUnits: number | null;
  description: string | null;
  addedAt: string;
  progress: MemberProgressSummary[];
}

export interface ExternalSearchResult {
  title: string | null;
  creator: string | null;
  coverUrl: string | null;
  totalUnits: number | null;
  description: string | null;
  type: string;
  externalId: string | null;
}
