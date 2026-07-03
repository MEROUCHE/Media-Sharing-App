package com.idk.Media_Sharing_App.group;

import com.idk.Media_Sharing_App.common.PagedResponse;
import com.idk.Media_Sharing_App.security.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.function.EntityResponse;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/groups")
public class GroupController {

    private final GroupService groupService;

    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    // GET /groups?search=&page=1&limit=10
    @GetMapping
    public ResponseEntity<PagedResponse<GroupSummaryResponse>> getAllGroups(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(groupService.getAllGroups(search, page, limit));
    }

    // POST /groups
    @PostMapping
    public ResponseEntity<GroupCreateResponse> createGroup(
            @RequestBody @Valid CreateGroupRequest request ) {
        UUID creatorId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(groupService.createGroup(request));
    }

    // GET /groups/:id
    @GetMapping("/{id}")
    public ResponseEntity<GroupDetailResponse> getGroupById(@PathVariable UUID id) {
        return ResponseEntity.ok(groupService.getGroupById(id));
    }

    // PATCH /groups/:id
    @PatchMapping("/{id}")
    public ResponseEntity<GroupUpdateResponse> updateGroup(
            @PathVariable UUID id,
            @RequestBody UpdateGroupRequest request ) {
        UUID requesterId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(groupService.updateGroup(id,request));
    }

    // DELETE /groups/:id
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteGroup(
            @PathVariable UUID id) {
        UUID requesterId = SecurityUtils.getCurrentUserId();
        groupService.deleteGroup(id);
        return ResponseEntity.ok(Map.of("message", "Group deleted successfully"));
    }

    // POST /groups/:id/join
    @PostMapping("/{id}/join")
    public ResponseEntity<JoinGroupResponse> joinGroup(
            @PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(groupService.joinGroup(id));
    }

    // DELETE /groups/:id/leave
    @DeleteMapping("/{id}/leave")
    public ResponseEntity<Map<String, String>> leaveGroup(
            @PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        groupService.leaveGroup(id);
        return ResponseEntity.ok(Map.of("message", "Left the group successfully"));
    }

}
