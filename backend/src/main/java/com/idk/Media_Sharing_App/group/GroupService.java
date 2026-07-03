package com.idk.Media_Sharing_App.group;

import com.idk.Media_Sharing_App.common.PagedResponse;

import java.util.List;
import java.util.UUID;

public interface GroupService {
    PagedResponse<GroupSummaryResponse> getAllGroups(String search, int page, int limit);

    GroupCreateResponse createGroup(CreateGroupRequest request);

    GroupDetailResponse getGroupById(UUID id);

    GroupUpdateResponse updateGroup(UUID groupId,UpdateGroupRequest request);

    void deleteGroup(UUID groupId);

    JoinGroupResponse joinGroup(UUID groupId);

    void leaveGroup(UUID groupId);

}