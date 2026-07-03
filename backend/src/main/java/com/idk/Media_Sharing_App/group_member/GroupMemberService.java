package com.idk.Media_Sharing_App.group_member;

import java.util.UUID;

public interface GroupMemberService {

    GroupMemberListResponse getMembers(UUID groupId);

    GroupMemberResponse getMember(UUID groupId, UUID userId);

    void removeMember(UUID groupId, UUID requesterId, UUID targetUserId);

}