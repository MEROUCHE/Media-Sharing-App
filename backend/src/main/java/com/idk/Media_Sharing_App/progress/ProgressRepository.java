package com.idk.Media_Sharing_App.progress;

import com.idk.Media_Sharing_App.media_item.MediaItem;
import com.idk.Media_Sharing_App.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProgressRepository extends JpaRepository<Progress, UUID> {
    List<Progress> findByUser(User user);

    List<Progress> findByMediaItem(MediaItem mediaItem);

    Optional<Progress> findByUserAndMediaItem(User user, MediaItem mediaItem);
}
