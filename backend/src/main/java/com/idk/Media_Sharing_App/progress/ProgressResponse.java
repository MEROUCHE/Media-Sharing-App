package com.idk.Media_Sharing_App.progress;

import java.time.LocalDateTime;
import java.util.UUID;

public record ProgressResponse(
        UUID userId,
        UUID mediaItemId,
        Integer currentUnit,
        Double percentage,
        String status,
        String note,
        LocalDateTime updatedAt
) {}