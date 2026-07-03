package com.idk.Media_Sharing_App.progress;

import java.util.UUID;

public interface ProgressService {
    AllProgressResponse getAllProgress(UUID groupId, UUID mediaItemId);
    ProgressResponse upsertProgress(UUID groupId, UUID mediaItemId, UpsertProgressRequest request);
    ProgressDetailResponse getUserProgress(UUID groupId, UUID mediaItemId, UUID userId);
}