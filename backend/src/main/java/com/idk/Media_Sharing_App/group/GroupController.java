package com.idk.Media_Sharing_App.group;

import com.idk.Media_Sharing_App.common.PagedResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.function.EntityResponse;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/group")
public class GroupController {

    private final GroupService groupService;

    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    // GET /group?search=&page=1&limit=10
    @GetMapping
    public ResponseEntity<PagedResponse<GroupSummaryResponse>> getAllGroups(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(groupService.getAllGroups(search, page, limit));
    }

    // POST /group
    @PostMapping
    public ResponseEntity<GroupCreateResponse> createGroup(
            @RequestBody @Valid CreateGroupRequest request,
            @RequestParam UUID creatorId) {  // TODO: get from SecurityContext after auth
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(groupService.createGroup(creatorId, request));
    }

    // GET /group/:id
    @GetMapping("/{id}")
    public ResponseEntity<GroupDetailResponse> getGroupById(@PathVariable UUID id) {
        return ResponseEntity.ok(groupService.getGroupById(id));
    }

    // PATCH /group/:id
    @PatchMapping("/{id}")
    public ResponseEntity<GroupUpdateResponse> updateGroup(
            @PathVariable UUID id,
            @RequestBody UpdateGroupRequest request,
            @RequestParam UUID requesterId) {  // TODO: get from SecurityContext
        return ResponseEntity.ok(groupService.updateGroup(id, requesterId, request));
    }

    // DELETE /group/:id
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteGroup(
            @PathVariable UUID id,
            @RequestParam UUID requesterId) {  // TODO: get from SecurityContext
        groupService.deleteGroup(id, requesterId);
        return ResponseEntity.ok(Map.of("message", "Group deleted successfully"));
    }

    // POST /group/:id/join
    @PostMapping("/{id}/join")
    public ResponseEntity<JoinGroupResponse> joinGroup(
            @PathVariable UUID id,
            @RequestParam UUID userId) {  // TODO: get from SecurityContext
        return ResponseEntity.ok(groupService.joinGroup(id, userId));
    }

    // DELETE /group/:id/leave
    @DeleteMapping("/{id}/leave")
    public ResponseEntity<Map<String, String>> leaveGroup(
            @PathVariable UUID id,
            @RequestParam UUID userId) {  // TODO: get from SecurityContext
        groupService.leaveGroup(id, userId);
        return ResponseEntity.ok(Map.of("message", "Left the group successfully"));
    }

    // DELETE /group/:id/members/:userId
    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<Map<String, String>> removeMember(
            @PathVariable UUID id,
            @PathVariable UUID userId,
            @RequestParam UUID requesterId) {  // TODO: get from SecurityContext
        groupService.removeMember(id, requesterId, userId);
        return ResponseEntity.ok(Map.of("message", "Member removed successfully"));
    }

}
