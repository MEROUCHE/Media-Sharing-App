package com.idk.Media_Sharing_App.media_item;

import com.idk.Media_Sharing_App.common.SanitizationService;
import com.idk.Media_Sharing_App.group.Group;
import com.idk.Media_Sharing_App.group.GroupNotFoundException;
import com.idk.Media_Sharing_App.group.GroupRepository;
import com.idk.Media_Sharing_App.group.NotGroupMemberException;
import com.idk.Media_Sharing_App.group_member.GroupMemberRepository;
import com.idk.Media_Sharing_App.progress.Progress;
import com.idk.Media_Sharing_App.progress.ProgressRepository;
import com.idk.Media_Sharing_App.progress.ProgressSummaryResponse;
import com.idk.Media_Sharing_App.security.SecurityUtils;
import com.idk.Media_Sharing_App.user.User;
import com.idk.Media_Sharing_App.user.UserNotFoundException;
import com.idk.Media_Sharing_App.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
public class MediaItemServiceImpl implements MediaItemService {

    private final MediaItemRepository mediaItemRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final ProgressRepository progressRepository;
    private final UserRepository userRepository;
    private final SanitizationService sanitizationService;

    public MediaItemServiceImpl(MediaItemRepository mediaItemRepository,
                                GroupRepository groupRepository,
                                GroupMemberRepository groupMemberRepository,
                                ProgressRepository progressRepository,
                                UserRepository userRepository,
                                SanitizationService sanitizationService) {
        this.mediaItemRepository = mediaItemRepository;
        this.groupRepository = groupRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.progressRepository = progressRepository;
        this.userRepository = userRepository;
        this.sanitizationService = sanitizationService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<MediaItemResponse> getMediaItems(UUID groupId, String type) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException(groupId));

        List<MediaItem> items;

        if (type != null && !type.isBlank()) {
            // parse the type string into the enum — throws IllegalArgumentException
            // if invalid, which GlobalExceptionHandler converts to 400
            MediaItem.MediaType mediaType = MediaItem.MediaType.valueOf(type.toUpperCase());
            items = mediaItemRepository.findByGroupAndType(group, mediaType);
        } else {
            items = mediaItemRepository.findByGroup(group);
        }

        return items.stream()
                .map(this::toMediaItemResponse)
                .toList();
    }

    @Override
    @Transactional
    public MediaItemResponse addMediaItem(UUID groupId,CreateMediaItemRequest request) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException(groupId));

        UUID addedById = SecurityUtils.getCurrentUserId();

        User addedBy = userRepository.findById(addedById)
                .orElseThrow(() -> new UserNotFoundException(addedById));


        if (!groupMemberRepository.existsByGroupAndUser(group, addedBy)) {
            throw new NotGroupMemberException();
        }

        MediaItem item = new MediaItem();
        item.setGroup(group);
        item.setType(request.type());
        item.setTitle(sanitizationService.sanitize(request.title(), 200));
        item.setCreator(sanitizationService.sanitize(request.creator(), 100));
        item.setDescription(sanitizationService.sanitize(request.description(), 1000));
        item.setCoverUrl(sanitizationService.sanitize(request.coverUrl(), 500));
        item.setTotalUnits(request.totalUnits());
        item.setAddedBy(addedBy);

        MediaItem saved = mediaItemRepository.save(item);
        return toMediaItemResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public MediaItemDetailResponse getMediaItemById(UUID groupId, UUID mediaId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException(groupId));

        MediaItem item = mediaItemRepository.findById(mediaId)
                .orElseThrow(() -> new MediaItemNotFoundException(mediaId));

        // confirm item actually belongs to this group
        if (!item.getGroup().getId().equals(groupId)) {
            throw new MediaItemNotFoundException(mediaId);
        }

        List<ProgressSummaryResponse> progressList = progressRepository
                .findByMediaItem(item)
                .stream()
                .map(p -> toProgressSummary(p, item.getTotalUnits()))
                .toList();

        return new MediaItemDetailResponse(
                item.getId(),
                item.getType().name().toLowerCase(),
                item.getTitle(),
                item.getCreator(),
                item.getCoverUrl(),
                item.getTotalUnits(),
                item.getDescription(),
                item.getAddedAt(),
                progressList
        );
    }

    @Override
    @Transactional
    public void removeMediaItem(UUID groupId,UUID mediaId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException(groupId));

        UUID requesterId = SecurityUtils.getCurrentUserId();

        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new UserNotFoundException(requesterId));

        // any member can remove — not creator only
        if (!groupMemberRepository.existsByGroupAndUser(group, requester)) {
            throw new NotGroupMemberException();
        }

        MediaItem item = mediaItemRepository.findById(mediaId)
                .orElseThrow(() -> new MediaItemNotFoundException(mediaId));

        if (!item.getGroup().getId().equals(groupId)) {
            throw new MediaItemNotFoundException(mediaId);
        }

        mediaItemRepository.delete(item);
    }



    private MediaItemResponse toMediaItemResponse(MediaItem item) {
        return new MediaItemResponse(
                item.getId(),
                item.getType().name().toLowerCase(),
                item.getTitle(),
                item.getCreator(),
                item.getCoverUrl(),
                item.getTotalUnits(),
                item.getDescription(),
                item.getAddedBy() != null ? item.getAddedBy().getId() : null,
                item.getAddedAt()
        );
    }

    private ProgressSummaryResponse toProgressSummary(Progress p, Integer totalUnits) {
        Double percentage = null;
        if (totalUnits != null && totalUnits > 0) {
            percentage = Math.round((p.getCurrentUnit() * 100.0 / totalUnits) * 10) / 10.0;
        }

        return new ProgressSummaryResponse(
                p.getUser().getId(),
                p.getUser().getUsername(),
                p.getUser().getAvatarUrl(),
                p.getCurrentUnit(),
                percentage,
                p.getStatus().name().toLowerCase(),
                p.getNote(),
                p.getUpdatedAt()
        );
    }
}