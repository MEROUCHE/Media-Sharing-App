package com.idk.Media_Sharing_App.media_item;

import java.util.UUID;

public class MediaItemNotFoundException extends RuntimeException {
    public MediaItemNotFoundException(UUID id) {
        super("Media item not found with id: " + id);
    }
}