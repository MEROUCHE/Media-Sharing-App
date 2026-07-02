package com.idk.Media_Sharing_App.group;

import com.idk.Media_Sharing_App.common.PagedResponse;

import java.util.List;
import java.util.UUID;

public interface GroupService {
    PagedResponse<GroupSummaryResponse> getAllGroups(String search, int page, int limit);

    GroupCreateResponse createGroup(UUID creatorId, CreateGroupRequest request);

    GroupDetailResponse getGroupById(UUID id);

    GroupUpdateResponse updateGroup(UUID groupId, UUID requesterId, UpdateGroupRequest request);

    void deleteGroup(UUID groupId, UUID requesterId);

    JoinGroupResponse joinGroup(UUID groupId, UUID userId);

    void leaveGroup(UUID groupId, UUID userId);

    void removeMember(UUID groupId, UUID requesterId, UUID targetUserId);

}