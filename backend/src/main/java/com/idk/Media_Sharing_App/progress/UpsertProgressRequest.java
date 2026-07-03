package com.idk.Media_Sharing_App.progress;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpsertProgressRequest(

        @NotNull(message = "current_unit is required")
        @Min(value = 0, message = "current_unit cannot be negative")
        Integer currentUnit,

        Progress.Status status,

        String note
) {}