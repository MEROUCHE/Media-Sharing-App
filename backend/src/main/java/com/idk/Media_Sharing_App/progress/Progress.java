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
import java.util.Objects;
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

    public Progress() {
    }

    public Progress(User user, MediaItem mediaItem, Integer currentUnit, Status status, String note) {
        this.user = user;
        this.mediaItem = mediaItem;
        this.currentUnit = currentUnit;
        this.status = status;
        this.note = note;
    }

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (currentUnit == null) currentUnit = 0;
    }

    public enum Status {
        NOT_STARTED, IN_PROGRESS, FINISHED
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public MediaItem getMediaItem() {
        return mediaItem;
    }

    public void setMediaItem(MediaItem mediaItem) {
        this.mediaItem = mediaItem;
    }

    public Integer getCurrentUnit() {
        return currentUnit;
    }

    public void setCurrentUnit(Integer currentUnit) {
        this.currentUnit = currentUnit;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Progress progress = (Progress) o;
        return Objects.equals(user, progress.user) && Objects.equals(mediaItem, progress.mediaItem) && Objects.equals(currentUnit, progress.currentUnit) && status == progress.status && Objects.equals(note, progress.note) && Objects.equals(updatedAt, progress.updatedAt);
    }

    @Override
    public int hashCode() {
        return Objects.hash(user, mediaItem, currentUnit, status, note, updatedAt);
    }

    @Override
    public String toString() {
        return "Progress{" +
                "user=" + user +
                ", mediaItem=" + mediaItem +
                ", currentUnit=" + currentUnit +
                ", status=" + status +
                ", note='" + note + '\'' +
                ", updatedAt=" + updatedAt +
                '}';
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
