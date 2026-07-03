package com.idk.Media_Sharing_App.group_member;

import java.util.List;
import java.util.UUID;

public record GroupMemberListResponse(
        UUID groupId,
        List<GroupMemberResponse> members
) {}