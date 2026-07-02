package com.idk.Media_Sharing_App.media_item;

import java.time.LocalDateTime;
import java.util.UUID;

public record ProgressSummaryResponse(
        UUID userId,
        String username,
        String avatarUrl,
        Integer currentUnit,
        Double percentage,
        String status,
        String note,
        LocalDateTime updatedAt
) {}