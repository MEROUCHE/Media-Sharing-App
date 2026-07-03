package com.idk.Media_Sharing_App.media_item;

import java.util.List;
import java.util.UUID;

public interface MediaItemService {
    List<MediaItemResponse> getMediaItems(UUID groupId, String type);
    MediaItemResponse addMediaItem(UUID groupId, CreateMediaItemRequest request);
    MediaItemDetailResponse getMediaItemById(UUID groupId, UUID mediaId);
    void removeMediaItem(UUID groupId, UUID mediaId);
}