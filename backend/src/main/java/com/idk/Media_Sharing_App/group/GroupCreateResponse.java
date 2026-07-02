package com.idk.Media_Sharing_App.group;

import java.time.LocalDateTime;
import java.util.UUID;

public record GroupCreateResponse(
        UUID id,
        String name,
        String description,
        UUID creatorId,
        LocalDateTime createdAt
) {}