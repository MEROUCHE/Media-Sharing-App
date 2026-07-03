package com.idk.Media_Sharing_App.progress;

import java.time.LocalDateTime;
import java.util.UUID;

public record ProgressDetailResponse(
        UUID userId,
        String username,
        UUID mediaItemId,
        Integer currentUnit,
        Double percentage,
        String status,
        String note,
        LocalDateTime updatedAt
) {}