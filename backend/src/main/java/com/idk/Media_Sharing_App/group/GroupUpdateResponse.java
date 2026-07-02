package com.idk.Media_Sharing_App.group;

import java.time.LocalDateTime;
import java.util.UUID;

public record GroupUpdateResponse(
        UUID id,
        String name,
        String description,
        LocalDateTime updatedAt
) {}