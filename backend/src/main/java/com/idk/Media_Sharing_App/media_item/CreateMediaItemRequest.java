package com.idk.Media_Sharing_App.media_item;

import com.idk.Media_Sharing_App.media_item.MediaItem.MediaType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateMediaItemRequest(

        @NotNull(message = "Type is required")
        MediaType type,

        @NotBlank(message = "Title is required")
        String title,

        String creator,
        String coverUrl,
        Integer totalUnits,
        String description
) {}