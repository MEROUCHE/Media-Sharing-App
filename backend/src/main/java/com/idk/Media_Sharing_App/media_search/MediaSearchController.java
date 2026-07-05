package com.idk.Media_Sharing_App.media_search;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/media/search")
public class MediaSearchController {

    private final MediaSearchService mediaSearchService;

    public MediaSearchController(MediaSearchService mediaSearchService) {
        this.mediaSearchService = mediaSearchService;
    }

    // GET /api/media/search?query=dune&type=book
    @GetMapping
    public ResponseEntity<List<MediaSearchResult>> search(
            @RequestParam String query,
            @RequestParam String type) {
        return ResponseEntity.ok(mediaSearchService.search(query, type));
    }
}