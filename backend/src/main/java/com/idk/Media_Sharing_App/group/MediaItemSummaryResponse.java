package com.idk.Media_Sharing_App.group;

import java.time.LocalDateTime;
import java.util.UUID;

public record MediaItemSummaryResponse(
        UUID id,
        String title,
        String creator,
        String coverUrl,
        Integer totalUnits,
        LocalDateTime addedAt
) {}