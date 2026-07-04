package com.idk.Media_Sharing_App.media_item;

import com.idk.Media_Sharing_App.security.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/groups/{groupId}/media")
public class MediaItemController {

    private final MediaItemService mediaItemService;

    public MediaItemController(MediaItemService mediaItemService) {
        this.mediaItemService = mediaItemService;
    }

    // GET /groups/:groupId/media?type=book
    @GetMapping
    public ResponseEntity<Map<String, List<MediaItemResponse>>> getMediaItems(
            @PathVariable UUID groupId,
            @RequestParam(required = false) String type) {
        List<MediaItemResponse> items = mediaItemService.getMediaItems(groupId, type);
        return ResponseEntity.ok(Map.of("data", items));
    }

    // POST /groups/:groupId/media
    @PostMapping
    public ResponseEntity<MediaItemResponse> addMediaItem(
            @PathVariable UUID groupId,
            @RequestBody @Valid CreateMediaItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mediaItemService.addMediaItem(groupId, request));
    }

    // GET /groups/:groupId/media/:mediaId
    @GetMapping("/{mediaId}")
    public ResponseEntity<MediaItemDetailResponse> getMediaItemById(
            @PathVariable UUID groupId,
            @PathVariable UUID mediaId) {
        return ResponseEntity.ok(mediaItemService.getMediaItemById(groupId, mediaId));
    }

    // DELETE /groups/:groupId/media/:mediaId
    @DeleteMapping("/{mediaId}")
    public ResponseEntity<Map<String, String>> removeMediaItem(
            @PathVariable UUID groupId,
            @PathVariable UUID mediaId) {

        mediaItemService.removeMediaItem(groupId, mediaId);
        return ResponseEntity.ok(Map.of("message", "Media item removed successfully"));
    }
}