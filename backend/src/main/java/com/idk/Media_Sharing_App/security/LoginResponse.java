package com.idk.Media_Sharing_App.security;

import java.util.UUID;

public record LoginResponse(
        String token,
        String refreshToken,
        UUID userId,
        String username,
        String email
) {}