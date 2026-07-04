package com.idk.Media_Sharing_App.group;

import java.time.LocalDateTime;
import java.util.UUID;

public record GroupSummaryResponse(
        UUID id,
        String name,
        String description,
        UUID creatorId,
        String creatorUsername,
        long memberCount,
        long mediaItemCount,
        LocalDateTime createdAt
) {}