package com.idk.Media_Sharing_App.group;

public record UpdateGroupRequest(
        String name,
        String description,
        Boolean isPublic
) {}