package com.idk.Media_Sharing_App.media_item;

import com.idk.Media_Sharing_App.group.Group;
import com.idk.Media_Sharing_App.user.User;
import jakarta.persistence.Entity;
import jakarta.persistence.*;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "media_items")
public class MediaItem {
    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private MediaType type; // BOOK, MOVIE, SHOW, GAME...

    @Column(nullable = false)
    private String title;

    private String creator; // author, director, studio — generic

    private String coverUrl;

    private Integer totalUnits; // pages, minutes, episodes — generic

    private String description;

    @ManyToOne
    @JoinColumn(name = "added_by")
    private User addedBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime addedAt;

    public MediaItem() {
    }

    public MediaItem(UUID id, Group group, MediaType type, String title, String creator, String coverUrl, Integer totalUnits, String description, User addedBy) {
        this.id = id;
        this.group = group;
        this.type = type;
        this.title = title;
        this.creator = creator;
        this.coverUrl = coverUrl;
        this.totalUnits = totalUnits;
        this.description = description;
        this.addedBy = addedBy;
    }

    @PrePersist
    protected void onCreate() {
        addedAt = LocalDateTime.now();
    }

    public enum MediaType {
        BOOK, MOVIE, SHOW, GAME
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Group getGroup() {
        return group;
    }

    public void setGroup(Group group) {
        this.group = group;
    }

    public MediaType getType() {
        return type;
    }

    public void setType(MediaType type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCreator() {
        return creator;
    }

    public void setCreator(String creator) {
        this.creator = creator;
    }

    public String getCoverUrl() {
        return coverUrl;
    }

    public void setCoverUrl(String coverUrl) {
        this.coverUrl = coverUrl;
    }

    public Integer getTotalUnits() {
        return totalUnits;
    }

    public void setTotalUnits(Integer totalUnits) {
        this.totalUnits = totalUnits;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public User getAddedBy() {
        return addedBy;
    }

    public void setAddedBy(User addedBy) {
        this.addedBy = addedBy;
    }

    public LocalDateTime getAddedAt() {
        return addedAt;
    }

    public void setAddedAt(LocalDateTime addedAt) {
        this.addedAt = addedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        MediaItem mediaItem = (MediaItem) o;
        return Objects.equals(id, mediaItem.id) && Objects.equals(group, mediaItem.group) && type == mediaItem.type && Objects.equals(title, mediaItem.title) && Objects.equals(creator, mediaItem.creator) && Objects.equals(coverUrl, mediaItem.coverUrl) && Objects.equals(totalUnits, mediaItem.totalUnits) && Objects.equals(description, mediaItem.description) && Objects.equals(addedBy, mediaItem.addedBy) && Objects.equals(addedAt, mediaItem.addedAt);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, group, type, title, creator, coverUrl, totalUnits, description, addedBy, addedAt);
    }

    @Override
    public String toString() {
        return "MediaItem{" +
                "id=" + id +
                ", group=" + group +
                ", type=" + type +
                ", title='" + title + '\'' +
                ", creator='" + creator + '\'' +
                ", coverUrl='" + coverUrl + '\'' +
                ", totalUnits=" + totalUnits +
                ", description='" + description + '\'' +
                ", addedBy=" + addedBy +
                ", addedAt=" + addedAt +
                '}';
    }
}
