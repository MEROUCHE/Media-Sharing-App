package com.idk.Media_Sharing_App.group_member;

import com.idk.Media_Sharing_App.group.Group;
import com.idk.Media_Sharing_App.group.GroupNotFoundException;
import com.idk.Media_Sharing_App.group.GroupRepository;
import com.idk.Media_Sharing_App.group.NotGroupCreatorException;
import com.idk.Media_Sharing_App.group.NotGroupMemberException;
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

    @Override
    public GroupMemberListResponse getMembers(UUID groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException(groupId));

        List<GroupMemberResponse> members = groupMemberRepository.findByGroup(group)
                .stream()
                .map(this::toMemberResponse)
                .toList();

        return new GroupMemberListResponse(groupId, members);
    }

    @Override
    public GroupMemberResponse getMember(UUID groupId, UUID userId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException(groupId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        GroupMember member = groupMemberRepository.findByGroupAndUser(group, user)
                .orElseThrow(() -> new NotGroupMemberException());

        return toMemberResponse(member);
    }

    @Override
    @Transactional
    public void removeMember(UUID groupId, UUID requesterId, UUID targetUserId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException(groupId));

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