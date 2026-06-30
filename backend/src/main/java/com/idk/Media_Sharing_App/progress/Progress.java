package com.idk.Media_Sharing_App.progress;

import com.idk.Media_Sharing_App.media_item.MediaItem;
import com.idk.Media_Sharing_App.user.User;
import jakarta.persistence.Entity;
import jakarta.persistence.*;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "progress")
@IdClass(Progress.ProgressId.class)
public class Progress {
    @Id
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Id
    @ManyToOne
    @JoinColumn(name = "media_item_id")
    private MediaItem mediaItem;

    @Column(nullable = false)
    private Integer currentUnit;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Status status;

    private String note;

    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (currentUnit == null) currentUnit = 0;
    }

    public enum Status {
        NOT_STARTED, IN_PROGRESS, FINISHED
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProgressId implements Serializable {
        private UUID user;
        private UUID mediaItem;

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof ProgressId)) return false;
            ProgressId that = (ProgressId) o;
            return user.equals(that.user) && mediaItem.equals(that.mediaItem);
        }

        @Override
        public int hashCode() {
            return java.util.Objects.hash(user, mediaItem);
        }
    }
}
