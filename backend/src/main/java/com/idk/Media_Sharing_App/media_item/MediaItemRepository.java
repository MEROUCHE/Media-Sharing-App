package com.idk.Media_Sharing_App.media_item;

import com.idk.Media_Sharing_App.group.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MediaItemRepository extends JpaRepository<MediaItem, UUID> {
    List<MediaItem> findByGroup(Group group);

    List<MediaItem> findByGroupAndType(Group group, MediaItem.MediaType type);

    long countByGroup(Group group);
}
