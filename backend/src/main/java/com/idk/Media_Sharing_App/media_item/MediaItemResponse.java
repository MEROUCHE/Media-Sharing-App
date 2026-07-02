package com.idk.Media_Sharing_App.media_item;

import java.time.LocalDateTime;
import java.util.UUID;

public record MediaItemResponse(
        UUID id,
        String type,
        String title,
        String creator,
        String coverUrl,
        Integer totalUnits,
        String description,
        UUID addedBy,
        LocalDateTime addedAt
) {}