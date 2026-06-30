package com.idk.Media_Sharing_App.group;

import com.idk.Media_Sharing_App.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface GroupRepository extends JpaRepository<Group, UUID> {
    Optional<User> findByName(String name);
}