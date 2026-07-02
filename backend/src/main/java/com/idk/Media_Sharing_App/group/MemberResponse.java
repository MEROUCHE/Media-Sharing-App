package com.idk.Media_Sharing_App.group;

import java.time.LocalDateTime;
import java.util.UUID;

public record MemberResponse(
        UUID userId,
        String username,
        String avatarUrl,
        LocalDateTime joinedAt
) {}