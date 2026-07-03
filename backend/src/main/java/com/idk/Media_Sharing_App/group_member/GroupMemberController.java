package com.idk.Media_Sharing_App.group_member;

import com.idk.Media_Sharing_App.security.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/groups/{groupId}/members")
public class GroupMemberController {

    private final GroupMemberService groupMemberService;

    public GroupMemberController(GroupMemberService groupMemberService) {
        this.groupMemberService = groupMemberService;
    }

    // GET /groups/:groupId/members
    @GetMapping
    public ResponseEntity<GroupMemberListResponse> getMembers(
            @PathVariable UUID groupId) {
        return ResponseEntity.ok(groupMemberService.getMembers(groupId));
    }

    // GET /groups/:groupId/members/:userId
    @GetMapping("/{userId}")
    public ResponseEntity<GroupMemberResponse> getMember(
            @PathVariable UUID groupId,
            @PathVariable UUID userId) {
        return ResponseEntity.ok(groupMemberService.getMember(groupId, userId));
    }

    // DELETE /groups/:groupId/members/:userId
    @DeleteMapping("/{userId}")
    public ResponseEntity<Map<String, String>> removeMember(
            @PathVariable UUID groupId,
            @PathVariable UUID userId ) {
        groupMemberService.removeMember(groupId, userId);
        return ResponseEntity.ok(Map.of("message", "Member removed successfully"));
    }

    // note adding memers are hundeled in the GroupServiceImpl (POST /api/groups/{id}/join)not here
}