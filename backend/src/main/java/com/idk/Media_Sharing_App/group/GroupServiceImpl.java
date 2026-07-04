package com.idk.Media_Sharing_App.group;

import com.idk.Media_Sharing_App.common.PagedResponse;
import com.idk.Media_Sharing_App.group_member.GroupMember;
import com.idk.Media_Sharing_App.group_member.GroupMemberRepository;
import com.idk.Media_Sharing_App.media_item.MediaItem;
import com.idk.Media_Sharing_App.media_item.MediaItemRepository;
import com.idk.Media_Sharing_App.progress.ProgressRepository;
import com.idk.Media_Sharing_App.security.SecurityUtils;
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
    private final ProgressRepository  progressRepository;

    public GroupServiceImpl(GroupRepository groupRepository,
                            GroupMemberRepository groupMemberRepository,
                            MediaItemRepository mediaItemRepository,
                            UserRepository userRepository,
                            ProgressRepository progressRepository) {
        this.groupRepository = groupRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.mediaItemRepository = mediaItemRepository;
        this.userRepository = userRepository;
        this.progressRepository = progressRepository;
    }

    @Override
    @Transactional(readOnly = true)
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
    public GroupCreateResponse createGroup(CreateGroupRequest request) {
        UUID creatorId = SecurityUtils.getCurrentUserId();
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
    @Transactional(readOnly = true)
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
    public GroupUpdateResponse updateGroup(UUID groupId,UpdateGroupRequest request) {

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException(groupId));

        UUID requesterId = SecurityUtils.getCurrentUserId();

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
    public void deleteGroup(UUID groupId) {
        UUID requesterId = SecurityUtils.getCurrentUserId();
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException(groupId));




        if (!group.getCreator().getId().equals(requesterId)) {
            throw new NotGroupCreatorException("delete it");
        }

        // delete progress for all media items in this group
        List<MediaItem> mediaItems = mediaItemRepository.findByGroup(group);
        for (MediaItem item : mediaItems) {
            progressRepository.deleteAll(progressRepository.findByMediaItem(item));
        }

        // delete media items
        mediaItemRepository.deleteAll(mediaItems);

        // delete members
        groupMemberRepository.deleteAll(groupMemberRepository.findByGroup(group));

        // now safe to delete the group
        groupRepository.delete(group);
    }

    @Override
    @Transactional
    public JoinGroupResponse joinGroup(UUID groupId) {
        UUID userId = SecurityUtils.getCurrentUserId();
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
    public void leaveGroup(UUID groupId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException(groupId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        // creator cannot leave — must delete instead
        if (group.getCreator().getId().equals(userId)) {
            throw new CreatorCannotLeaveException();
        }

        if (!groupMemberRepository.existsByGroupAndUser(group, user)) {
            throw new NotMemberException();
        }

        groupMemberRepository.deleteByGroupAndUser(group, user);
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