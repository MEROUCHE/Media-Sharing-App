package com.idk.Media_Sharing_App.progress;

import com.idk.Media_Sharing_App.group.Group;
import com.idk.Media_Sharing_App.group.GroupNotFoundException;
import com.idk.Media_Sharing_App.group.GroupRepository;
import com.idk.Media_Sharing_App.group.NotGroupMemberException;
import com.idk.Media_Sharing_App.group_member.GroupMemberRepository;
import com.idk.Media_Sharing_App.media_item.MediaItem;
import com.idk.Media_Sharing_App.media_item.MediaItemNotFoundException;
import com.idk.Media_Sharing_App.media_item.MediaItemRepository;
import com.idk.Media_Sharing_App.user.User;
import com.idk.Media_Sharing_App.user.UserNotFoundException;
import com.idk.Media_Sharing_App.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
public class ProgressServiceImpl implements ProgressService {

    private final ProgressRepository progressRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final MediaItemRepository mediaItemRepository;
    private final UserRepository userRepository;

    public ProgressServiceImpl(ProgressRepository progressRepository,
                               GroupRepository groupRepository,
                               GroupMemberRepository groupMemberRepository,
                               MediaItemRepository mediaItemRepository,
                               UserRepository userRepository) {
        this.progressRepository = progressRepository;
        this.groupRepository = groupRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.mediaItemRepository = mediaItemRepository;
        this.userRepository = userRepository;
    }

    @Override
    public AllProgressResponse getAllProgress(UUID groupId, UUID mediaItemId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException(groupId));

        MediaItem item = getMediaItemInGroup(mediaItemId, groupId);

        List<ProgressSummaryResponse> data = progressRepository.findByMediaItem(item)
                .stream()
                .map(p -> toProgressSummary(p, item.getTotalUnits()))
                .toList();

        return new AllProgressResponse(mediaItemId, data);
    }

    @Override
    @Transactional
    public ProgressResponse upsertProgress(UUID groupId, UUID mediaItemId,
                                           UUID userId, UpsertProgressRequest request) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException(groupId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        // must be a group member to track progress
        if (!groupMemberRepository.existsByGroupAndUser(group, user)) {
            throw new NotGroupMemberException();
        }

        MediaItem item = getMediaItemInGroup(mediaItemId, groupId);

        // validate current_unit doesn't exceed total_units
        if (item.getTotalUnits() != null && request.currentUnit() > item.getTotalUnits()) {
            throw new InvalidProgressException(
                    "current_unit cannot exceed total_units (" + item.getTotalUnits() + ")"
            );
        }

        // find existing progress or create new
        Progress progress = progressRepository
                .findByUserAndMediaItem(user, item)
                .orElseGet(() -> {
                    Progress p = new Progress();
                    p.setUser(user);
                    p.setMediaItem(item);
                    return p;
                });

        progress.setCurrentUnit(request.currentUnit());
        progress.setNote(request.note());

        // auto-set status if not provided
        if (request.status() != null) {
            progress.setStatus(request.status());
        } else {
            progress.setStatus(autoStatus(request.currentUnit(), item.getTotalUnits()));
        }

        Progress saved = progressRepository.save(progress);
        return toProgressResponse(saved, item.getTotalUnits());
    }

    @Override
    public ProgressDetailResponse getUserProgress(UUID groupId, UUID mediaItemId, UUID userId) {
        MediaItem item = getMediaItemInGroup(mediaItemId, groupId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        Progress progress = progressRepository.findByUserAndMediaItem(user, item)
                .orElseThrow(() -> new ProgressNotFoundException(userId, mediaItemId));

        Double percentage = calculatePercentage(progress.getCurrentUnit(), item.getTotalUnits());

        return new ProgressDetailResponse(
                user.getId(),
                user.getUsername(),
                item.getId(),
                progress.getCurrentUnit(),
                percentage,
                progress.getStatus().name().toLowerCase(),
                progress.getNote(),
                progress.getUpdatedAt()
        );
    }


    // confirms media item exists AND belongs to the given group
    private MediaItem getMediaItemInGroup(UUID mediaItemId, UUID groupId) {
        MediaItem item = mediaItemRepository.findById(mediaItemId)
                .orElseThrow(() -> new MediaItemNotFoundException(mediaItemId));

        if (!item.getGroup().getId().equals(groupId)) {
            throw new MediaItemNotFoundException(mediaItemId);
        }
        return item;
    }

    // auto-set status based on current_unit vs total_units
    private Progress.Status autoStatus(Integer currentUnit, Integer totalUnits) {
        if (currentUnit == 0) return Progress.Status.NOT_STARTED;
        if (totalUnits != null && currentUnit >= totalUnits) return Progress.Status.FINISHED;
        return Progress.Status.IN_PROGRESS;
    }

    private Double calculatePercentage(Integer currentUnit, Integer totalUnits) {
        if (totalUnits == null || totalUnits == 0) return null;
        return Math.round((currentUnit * 100.0 / totalUnits) * 10) / 10.0;
    }

    private ProgressResponse toProgressResponse(Progress p, Integer totalUnits) {
        return new ProgressResponse(
                p.getUser().getId(),
                p.getMediaItem().getId(),
                p.getCurrentUnit(),
                calculatePercentage(p.getCurrentUnit(), totalUnits),
                p.getStatus().name().toLowerCase(),
                p.getNote(),
                p.getUpdatedAt()
        );
    }

    private ProgressSummaryResponse toProgressSummary(Progress p, Integer totalUnits) {
        return new ProgressSummaryResponse(
                p.getUser().getId(),
                p.getUser().getUsername(),
                p.getUser().getAvatarUrl(),
                p.getCurrentUnit(),
                calculatePercentage(p.getCurrentUnit(), totalUnits),
                p.getStatus().name().toLowerCase(),
                p.getNote(),
                p.getUpdatedAt()
        );
    }
}