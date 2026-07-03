package com.idk.Media_Sharing_App.progress;

import com.idk.Media_Sharing_App.security.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/groups/{groupId}/media/{mediaId}/progress")
public class ProgressController {

    private final ProgressService progressService;

    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    // GET /groups/:groupId/media/:mediaId/progress
    @GetMapping
    public ResponseEntity<AllProgressResponse> getAllProgress(
            @PathVariable UUID groupId,
            @PathVariable UUID mediaId) {
        return ResponseEntity.ok(progressService.getAllProgress(groupId, mediaId));
    }

    // POST /groups/:groupId/media/:mediaId/progress
    @PostMapping
    public ResponseEntity<ProgressResponse> upsertProgress(
            @PathVariable UUID groupId,
            @PathVariable UUID mediaId,
            @RequestBody @Valid UpsertProgressRequest request ) {

        return ResponseEntity.ok(progressService.upsertProgress(groupId, mediaId, request));
    }

    // GET /groups/:groupId/media/:mediaId/progress/:userId
    @GetMapping("/{userId}")
    public ResponseEntity<ProgressDetailResponse> getUserProgress(
            @PathVariable UUID groupId,
            @PathVariable UUID mediaId,
            @PathVariable UUID userId) {
        return ResponseEntity.ok(progressService.getUserProgress(groupId, mediaId, userId));
    }
}