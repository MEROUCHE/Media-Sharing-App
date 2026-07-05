package com.idk.Media_Sharing_App.group;

import com.idk.Media_Sharing_App.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface GroupRepository extends JpaRepository<Group, UUID> {
    Optional<User> findByName(String name);

    // for GET /groups with optional search + pagination
    Page<Group> findByNameContainingIgnoreCase(String name, Pageable pageable);

    // for simple "all groups by this user"
    java.util.List<Group> findByCreator(User creator);

    Optional<Group> findByInviteCode(String inviteCode);

    Page<Group> findByIsPublic(boolean isPublic, Pageable pageable);

    Page<Group> findByNameContainingIgnoreCaseAndIsPublic(String name, boolean isPublic, Pageable pageable);
}