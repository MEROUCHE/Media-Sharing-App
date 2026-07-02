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
import java.util.Objects;
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

    public GroupMember() {
    }

    public GroupMember(Group group, User user, Role role) {
        this.group = group;
        this.user = user;
        this.role = role;
    }


    @PrePersist
    protected void onCreate() {
        joinedAt = LocalDateTime.now();
    }

    public enum Role {
        OWNER, MEMBER
    }

    public Group getGroup() {
        return group;
    }

    public void setGroup(Group group) {
        this.group = group;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        GroupMember that = (GroupMember) o;
        return Objects.equals(group, that.group) && Objects.equals(user, that.user) && role == that.role && Objects.equals(joinedAt, that.joinedAt);
    }

    @Override
    public int hashCode() {
        return Objects.hash(group, user, role, joinedAt);
    }

    @Override
    public String toString() {
        return "GroupMember{" +
                "group=" + group +
                ", user=" + user +
                ", role=" + role +
                ", joinedAt=" + joinedAt +
                '}';
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
