package com.idk.Media_Sharing_App.user;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserProfileResponse(
    UUID id,
    String username,
    String avatarUrl,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
){}
