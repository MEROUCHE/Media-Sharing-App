package com.idk.Media_Sharing_App.group;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record GroupDetailResponse(
        UUID id,
        String name,
        String description,
        UUID creatorId,
        LocalDateTime createdAt,
        List<MemberResponse> members,
        List<MediaItemSummaryResponse> mediaItems
) {}