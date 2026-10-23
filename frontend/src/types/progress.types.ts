export interface UpsertProgressPayload {
  currentUnit: number;
  status?: "NOT_STARTED" | "IN_PROGRESS" | "FINISHED";
  note?: string;
}

export interface ProgressResponse {
  userId: string;
  mediaItemId: string;
  currentUnit: number;
  percentage: number | null;
  status: "not_started" | "in_progress" | "finished" | string;
  note: string | null;
  updatedAt: string;
}

export interface ProgressDetailResponse {
  userId: string;
  username: string;
  mediaItemId: string;
  currentUnit: number;
  percentage: number | null;
  status: "not_started" | "in_progress" | "finished" | string;
  note: string | null;
  updatedAt: string;
}

export interface AllProgressResponse {
  mediaItemId: string;
  data: {
    userId: string;
    username: string;
    avatarUrl: string | null;
    currentUnit: number;
    percentage: number | null;
    status: string;
    note: string | null;
    updatedAt: string;
  }[];
}
