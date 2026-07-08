package com.idk.Media_Sharing_App.security;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface EmailVerificationTokenRepository
        extends JpaRepository<EmailVerificationToken, UUID> {
    Optional<EmailVerificationToken> findByToken(String token);
    void deleteByUser(com.idk.Media_Sharing_App.user.User user);
}