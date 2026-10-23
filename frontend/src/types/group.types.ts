export interface GroupSummary {
  id: string;
  name: string;
  description: string | null;
  creatorId: string;
  creatorUsername: string;
  isPublic: boolean;
  inviteCode: string;
  memberCount: number;
  mediaItemCount: number;
  createdAt: string;
}

export interface PagedGroupsResponse {
  data: GroupSummary[];
  page: number;
  limit: number;
  total: number;
}

export interface CreateGroupPayload {
  name: string;
  description?: string;
  isPublic?: boolean;
}

export interface GroupCreateResponse {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  inviteCode: string;
  creatorId: string;
  createdAt: string;
}

export interface GroupMemberSummary {
  userId: string;
  username: string;
  avatarUrl: string | null;
  joinedAt: string;
}

export interface MediaItemSummary {
  id: string;
  title: string;
  type: "book" | "movie" | "show" | "game" | string;
  creator: string | null;
  coverUrl: string | null;
  totalUnits: number | null;
  addedAt: string;
}

export interface GroupDetail {
  id: string;
  name: string;
  description: string | null;
  creatorId: string;
  isPublic: boolean;
  inviteCode: string;
  createdAt: string;
  members: GroupMemberSummary[];
  mediaItems: MediaItemSummary[];
}

export interface UpdateGroupPayload {
  name?: string;
  description?: string;
  isPublic?: boolean;
}

export interface GroupUpdateResponse {
  id: string;
  name: string;
  description: string | null;
  updatedAt: string;
}

export interface GroupMemberDetail {
  userId: string;
  username: string;
  avatarUrl: string | null;
  role: "owner" | "member" | string;
  joinedAt: string;
}

export interface GroupMemberListResponse {
  groupId: string;
  members: GroupMemberDetail[];
}

export interface JoinGroupResponse {
  groupId: string;
  userId: string;
  joinedAt: string;
}
