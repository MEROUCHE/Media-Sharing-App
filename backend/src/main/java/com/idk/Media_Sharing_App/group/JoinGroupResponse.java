package com.idk.Media_Sharing_App.group;

import java.time.LocalDateTime;
import java.util.UUID;

public record JoinGroupResponse(
        UUID groupId,
        UUID userId,
        LocalDateTime joinedAt
) {}