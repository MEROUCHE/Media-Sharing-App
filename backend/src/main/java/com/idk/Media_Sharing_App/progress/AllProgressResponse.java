package com.idk.Media_Sharing_App.progress;

import java.util.List;
import java.util.UUID;

public record AllProgressResponse(
        UUID mediaItemId,
        List<ProgressSummaryResponse> data
) {}