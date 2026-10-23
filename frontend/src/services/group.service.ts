import api from "../api";
import type {
  GroupSummary,
  PagedGroupsResponse,
  CreateGroupPayload,
  GroupCreateResponse,
  GroupDetail,
  UpdateGroupPayload,
  GroupUpdateResponse,
  GroupMemberListResponse,
  GroupMemberDetail,
  JoinGroupResponse,
} from "../types/group.types";

export async function getAllGroups(
  search?: string,
  page: number = 1,
  limit: number = 10,
): Promise<PagedGroupsResponse> {
  const { data } = await api.get<PagedGroupsResponse>("/groups", {
    params: { search, page, limit },
  });
  return data;
}

export async function getMyGroups(): Promise<GroupSummary[]> {
  const { data } = await api.get<GroupSummary[]>("/groups/me");
  return data;
}

export async function createGroup(
  payload: CreateGroupPayload,
): Promise<GroupCreateResponse> {
  const { data } = await api.post<GroupCreateResponse>("/groups", payload);
  return data;
}

export async function getGroupById(id: string): Promise<GroupDetail> {
  const { data } = await api.get<GroupDetail>(`/groups/${id}`);
  return data;
}

export async function updateGroup(
  id: string,
  payload: UpdateGroupPayload,
): Promise<GroupUpdateResponse> {
  const { data } = await api.patch<GroupUpdateResponse>(`/groups/${id}`, payload);
  return data;
}

export async function deleteGroup(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/groups/${id}`);
  return data;
}

export async function joinGroupByCode(code: string): Promise<JoinGroupResponse> {
  const { data } = await api.post<JoinGroupResponse>(`/groups/join/${code}`);
  return data;
}

export async function leaveGroup(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/groups/${id}/leave`);
  return data;
}

export async function refreshInviteCode(id: string): Promise<{ inviteCode: string }> {
  const { data } = await api.post<{ inviteCode: string }>(
    `/groups/${id}/refresh-code`,
  );
  return data;
}

export async function getGroupMembers(
  groupId: string,
): Promise<GroupMemberListResponse> {
  const { data } = await api.get<GroupMemberListResponse>(
    `/groups/${groupId}/members`,
  );
  return data;
}

export async function getGroupMember(
  groupId: string,
  userId: string,
): Promise<GroupMemberDetail> {
  const { data } = await api.get<GroupMemberDetail>(
    `/groups/${groupId}/members/${userId}`,
  );
  return data;
}

export async function removeGroupMember(
  groupId: string,
  userId: string,
): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(
    `/groups/${groupId}/members/${userId}`,
  );
  return data;
}
