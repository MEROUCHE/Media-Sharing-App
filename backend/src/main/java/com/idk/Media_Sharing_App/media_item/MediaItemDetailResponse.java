package com.idk.Media_Sharing_App.media_item;

import com.idk.Media_Sharing_App.progress.ProgressSummaryResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record MediaItemDetailResponse(
        UUID id,
        String type,
        String title,
        String creator,
        String coverUrl,
        Integer totalUnits,
        String description,
        LocalDateTime addedAt,
        List<ProgressSummaryResponse> progress
) {}