package com.idk.Media_Sharing_App.security;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.UUID;

public class SecurityUtils {

    public static UUID getCurrentUserId() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        return UUID.fromString(userDetails.getUsername());
    }
}