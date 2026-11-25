package com.idk.Media_Sharing_App.group_member;

import com.idk.Media_Sharing_App.group.Group;
import com.idk.Media_Sharing_App.group.GroupNotFoundException;
import com.idk.Media_Sharing_App.group.GroupRepository;
import com.idk.Media_Sharing_App.group.NotGroupCreatorException;
import com.idk.Media_Sharing_App.group.NotGroupMemberException;
import com.idk.Media_Sharing_App.security.SecurityUtils;
import com.idk.Media_Sharing_App.user.User;
import com.idk.Media_Sharing_App.user.UserNotFoundException;
import com.idk.Media_Sharing_App.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
public class GroupMemberServiceImpl implements GroupMemberService {

    private final GroupMemberRepository groupMemberRepository;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;

    public GroupMemberServiceImpl(GroupMemberRepository groupMemberRepository,
                                  GroupRepository groupRepository,
                                  UserRepository userRepository) {
        this.groupMemberRepository = groupMemberRepository;
        this.groupRepository = groupRepository;
        this.userRepository = userRepository;
    }

    private void ensureCanViewGroup(Group group) {
        if (!Boolean.TRUE.equals(group.getIsPublic())) {
            UUID currentUserId = SecurityUtils.getCurrentUserId();
            User currentUser = userRepository.findById(currentUserId)
                    .orElseThrow(() -> new UserNotFoundException(currentUserId));
            if (!groupMemberRepository.existsByGroupAndUser(group, currentUser)) {
                throw new NotGroupMemberException();
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public GroupMemberListResponse getMembers(UUID groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException(groupId));
        ensureCanViewGroup(group);

        List<GroupMemberResponse> members = groupMemberRepository.findByGroup(group)
                .stream()
                .map(this::toMemberResponse)
                .toList();

        return new GroupMemberListResponse(groupId, members);
    }

    @Override
    @Transactional(readOnly = true)
    public GroupMemberResponse getMember(UUID groupId, UUID userId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException(groupId));
        ensureCanViewGroup(group);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        GroupMember member = groupMemberRepository.findByGroupAndUser(group, user)
                .orElseThrow(() -> new NotGroupMemberException());

        return toMemberResponse(member);
    }

    @Override
    @Transactional
    public void removeMember(UUID groupId, UUID targetUserId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException(groupId));

        UUID requesterId = SecurityUtils.getCurrentUserId();

        // only creator can remove members
        if (!group.getCreator().getId().equals(requesterId)) {
            throw new NotGroupCreatorException("remove members");
        }

        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new UserNotFoundException(targetUserId));

        if (!groupMemberRepository.existsByGroupAndUser(group, target)) {
            throw new NotGroupMemberException();
        }

        groupMemberRepository.deleteByGroupAndUser(group, target);
    }

    // --- private mapper ---

    private GroupMemberResponse toMemberResponse(GroupMember gm) {
        return new GroupMemberResponse(
                gm.getUser().getId(),
                gm.getUser().getUsername(),
                gm.getUser().getAvatarUrl(),
                gm.getRole().name().toLowerCase(),
                gm.getJoinedAt()
        );
    }
}