package com.idk.Media_Sharing_App.common;

import java.util.List;

public record PagedResponse<T>(
        List<T> data,
        int page,
        int limit,
        long total
) {}