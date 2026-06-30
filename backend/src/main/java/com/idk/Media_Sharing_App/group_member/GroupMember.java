package com.idk.Media_Sharing_App.group_member;

import com.idk.Media_Sharing_App.group.Group;
import com.idk.Media_Sharing_App.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "group_members")
@IdClass(GroupMember.GroupMemberId.class)
public class GroupMember {
    @Id
    @ManyToOne
    @JoinColumn(name = "group_id")
    private Group group;

    @Id
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Role role; // (OWNER / MEMBER)

    @Column(nullable = false, updatable = false)
    private LocalDateTime joinedAt;

    @PrePersist
    protected void onCreate() {
        joinedAt = LocalDateTime.now();
    }

    public enum Role {
        OWNER, MEMBER
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GroupMemberId implements Serializable {
        private UUID group;
        private UUID user;

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof GroupMemberId)) return false;
            GroupMemberId that = (GroupMemberId) o;
            return group.equals(that.group) && user.equals(that.user);
        }

        @Override
        public int hashCode() {
            return java.util.Objects.hash(group, user);
        }
    }
}
