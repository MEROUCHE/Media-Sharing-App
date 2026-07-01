package com.idk.Media_Sharing_App.user;

import java.util.UUID;

public record AuthResponse(
        UUID id,
        String username,
        String email
) {}