package com.idk.Media_Sharing_App.media_search;

public record MediaSearchResult(
        String title,
        String creator,
        String coverUrl,
        Integer totalUnits,
        String description,
        String type,
        String externalId
) {}