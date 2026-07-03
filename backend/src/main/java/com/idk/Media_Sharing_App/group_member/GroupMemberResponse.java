package com.idk.Media_Sharing_App.group_member;

import java.time.LocalDateTime;
import java.util.UUID;

public record GroupMemberResponse(
        UUID userId,
        String username,
        String avatarUrl,
        String role,
        LocalDateTime joinedAt
) {}