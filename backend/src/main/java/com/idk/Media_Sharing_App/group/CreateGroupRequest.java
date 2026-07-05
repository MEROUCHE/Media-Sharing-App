package com.idk.Media_Sharing_App.group;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public record CreateGroupRequest(
        @NotBlank(message = "Name is required")
        String name,
        String description,
        @JsonProperty("isPublic")
        Boolean isPublic
) {}