package com.idk.Media_Sharing_App.group;

import jakarta.validation.constraints.NotBlank;

public record CreateGroupRequest(
        @NotBlank(message = "Name is required")
        String name,
        String description
) {}