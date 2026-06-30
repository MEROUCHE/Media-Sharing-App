package com.idk.Media_Sharing_App.media_item;

import com.idk.Media_Sharing_App.group.Group;
import com.idk.Media_Sharing_App.user.User;
import jakarta.persistence.Entity;
import jakarta.persistence.*;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
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

    @PrePersist
    protected void onCreate() {
        addedAt = LocalDateTime.now();
    }

    public enum MediaType {
        BOOK, MOVIE, SHOW, GAME
    }
}
