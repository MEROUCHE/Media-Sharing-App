package com.idk.Media_Sharing_App.progress;

import java.util.UUID;

public class ProgressNotFoundException extends RuntimeException {
    public ProgressNotFoundException(UUID userId, UUID mediaItemId) {
        super("No progress found for this user on this media item");
    }
}