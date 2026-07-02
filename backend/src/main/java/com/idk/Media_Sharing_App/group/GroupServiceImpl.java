package com.idk.Media_Sharing_App.group;

import com.idk.Media_Sharing_App.common.PagedResponse;
import com.idk.Media_Sharing_App.group_member.GroupMember;
import com.idk.Media_Sharing_App.group_member.GroupMemberRepository;
import com.idk.Media_Sharing_App.media_item.MediaItemRepository;
import com.idk.Media_Sharing_App.user.User;
import com.idk.Media_Sharing_App.user.UserNotFoundException;
import com.idk.Media_Sharing_App.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
public class GroupServiceImpl implements GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final MediaItemRepository mediaItemRepository;
    private final UserRepository userRepository;

    public GroupServiceImpl(GroupRepository groupRepository,
                            GroupMemberRepository groupMemberRepository,
                            MediaItemRepository mediaItemRepository,
                            UserRepository userRepository) {
        this.groupRepository = groupRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.mediaItemRepository = mediaItemRepository;
        this.userRepository = userRepository;
    }

    @Override
    public PagedResponse<GroupSummaryResponse> getAllGroups(String search, int page, int limit) {
        // enforce max limit of 50
        int safeLimit = Math.min(limit, 50);
        PageRequest pageable = PageRequest.of(page - 1, safeLimit); // Spring pages are 0-indexed

        Page<Group> results = (search != null && !search.isBlank())
                ? groupRepository.findByNameContainingIgnoreCase(search, pageable)
                : groupRepository.findAll(pageable);

        List<GroupSummaryResponse> data = results.getContent()
                .stream()
                .map(this::toSummaryResponse)
                .toList();

        return new PagedResponse<>(data, page, safeLimit, results.getTotalElements());
    }

    @Override
    @Transactional
    public GroupCreateResponse createGroup(UUID creatorId, CreateGroupRequest request) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new UserNotFoundException(creatorId));

        Group group = new Group();
        group.setName(request.name());
        group.setDescription(request.description());
        group.setCreator(creator);

        Group saved = groupRepository.save(group);

        // automatically add creator as OWNER in group_members
        GroupMember membership = new GroupMember();
        membership.setGroup(saved);
        membership.setUser(creator);
        membership.setRole(GroupMember.Role.OWNER);
        groupMemberRepository.save(membership);

        return new GroupCreateResponse(
                saved.getId(),
                saved.getName(),
                saved.getDescription(),
                saved.getCreator().getId(),
                saved.getCreatedAt()
        );
    }

    @Override
    public GroupDetailResponse getGroupById(UUID id) {
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new GroupNotFoundException(id));

        List<MemberResponse> members = groupMemberRepository.findByGroup(group)
                .stream()
                .map(gm -> new MemberResponse(
                        gm.getUser().getId(),
                        gm.getUser().getUsername(),
                        gm.getUser().getAvatarUrl(),
                        gm.getJoinedAt()
                ))
                .toList();

        List<MediaItemSummaryResponse> mediaItems = mediaItemRepository.findByGroup(group)
                .stream()
                .map(item -> new MediaItemSummaryResponse(
                        item.getId(),
                        item.getType().name().toLowerCase(),
                        item.getTitle(),
                        item.getCreator(),
                        item.getCoverUrl(),
                        item.getTotalUnits(),
                        item.getAddedAt()
                ))
                .toList();

        return new GroupDetailResponse(
                group.getId(),
                group.getName(),
                group.getDescription(),
                group.getCreator().getId(),
                group.getCreatedAt(),
                members,
                mediaItems
        );
    }

    @Override
    @Transactional
    public GroupUpdateResponse updateGroup(UUID groupId, UUID requesterId, UpdateGroupRequest request) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException(groupId));

        // TODO: replace requesterId param with authenticated user from SecurityContext
        // once Spring Security is added
        if (!group.getCreator().getId().equals(requesterId)) {
            throw new NotGroupCreatorException("update it");
        }

        if (request.name() != null && !request.name().isBlank()) {
            group.setName(request.name());
        }
        if (request.description() != null) {
            group.setDescription(request.description());
        }

        Group saved = groupRepository.save(group);
        return new GroupUpdateResponse(
                saved.getId(),
                saved.getName(),
                saved.getDescription(),
                saved.getUpdatedAt()
        );
    }

    @Override
    @Transactional
    public void deleteGroup(UUID groupId, UUID requesterId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException(groupId));

        // TODO: replace with SecurityContext check after auth is added
        if (!group.getCreator().getId().equals(requesterId)) {
            throw new NotGroupCreatorException("delete it");
        }

        groupRepository.delete(group);
        // cascade delete handles group_members and media_items automatically
        // because of ON DELETE CASCADE on the foreign keys
    }

    @Override
    @Transactional
    public JoinGroupResponse joinGroup(UUID groupId, UUID userId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException(groupId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        if (groupMemberRepository.existsByGroupAndUser(group, user)) {
            throw new AlreadyMemberException();
        }

        GroupMember membership = new GroupMember();
        membership.setGroup(group);
        membership.setUser(user);
        membership.setRole(GroupMember.Role.MEMBER);
        GroupMember saved = groupMemberRepository.save(membership);

        return new JoinGroupResponse(
                group.getId(),
                user.getId(),
                saved.getJoinedAt()
        );
    }

    @Override
    @Transactional
    public void leaveGroup(UUID groupId, UUID userId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException(groupId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        // creator cannot leave — must delete instead
        if (group.getCreator().getId().equals(userId)) {
            throw new NotGroupCreatorException("leave — delete the group instead");
        }

        if (!groupMemberRepository.existsByGroupAndUser(group, user)) {
            throw new NotMemberException();
        }

        groupMemberRepository.deleteByGroupAndUser(group, user);
    }

    @Override
    @Transactional
    public void removeMember(UUID groupId, UUID requesterId, UUID targetUserId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException(groupId));

        // TODO: replace with SecurityContext check after auth is added
        if (!group.getCreator().getId().equals(requesterId)) {
            throw new NotGroupCreatorException("remove members");
        }

        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new UserNotFoundException(targetUserId));

        if (!groupMemberRepository.existsByGroupAndUser(group, target)) {
            throw new NotMemberException();
        }

        groupMemberRepository.deleteByGroupAndUser(group, target);
    }


    private GroupSummaryResponse toSummaryResponse(Group group) {
        return new GroupSummaryResponse(
                group.getId(),
                group.getName(),
                group.getDescription(),
                group.getCreator().getId(),
                group.getCreator().getUsername(),
                groupMemberRepository.countByGroup(group),
                mediaItemRepository.countByGroup(group),
                group.getCreatedAt()
        );
    }
}