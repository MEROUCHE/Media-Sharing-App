package com.idk.Media_Sharing_App.security;

import com.idk.Media_Sharing_App.email.EmailService;
import com.idk.Media_Sharing_App.user.User;
import com.idk.Media_Sharing_App.user.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final EmailVerificationTokenRepository emailTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.base-url}")
    private String baseUrl;

    public AuthService(EmailVerificationTokenRepository emailTokenRepository,
                       PasswordResetTokenRepository passwordResetTokenRepository,
                       UserRepository userRepository,
                       EmailService emailService,
                       PasswordEncoder passwordEncoder) {
        this.emailTokenRepository = emailTokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    // called after register

    @Transactional
    @Async
    public void sendVerificationEmail(User user) {
        emailTokenRepository.deleteByUser(user);

        EmailVerificationToken token = new EmailVerificationToken();
        token.setToken(UUID.randomUUID().toString());
        token.setUser(user);
        token.setExpiresAt(LocalDateTime.now().plusHours(24));
        emailTokenRepository.save(token);

        // build the full link here, pass it to EmailService
        String verificationLink = baseUrl + "/api/auth/verify-email?token=" + token.getToken();

        emailService.sendVerificationEmail(
                user.getEmail(),
                user.getUsername(),
                verificationLink
        );
    }

    // called when user clicks link in email
    @Transactional
    public void verifyEmail(String token) {
        EmailVerificationToken verificationToken = emailTokenRepository
                .findByToken(token)
                .orElseThrow(() -> new InvalidTokenException("Invalid verification token"));

        if (verificationToken.isUsed()) {
            throw new InvalidTokenException("Token already used");
        }

        if (verificationToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidTokenException("Verification token expired");
        }

        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);

        verificationToken.setUsed(true);
        emailTokenRepository.save(verificationToken);
    }

    // called when user requests password reset
    @Transactional
    public void sendPasswordResetEmail(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            passwordResetTokenRepository.deleteByUser(user);

            PasswordResetToken token = new PasswordResetToken();
            token.setToken(UUID.randomUUID().toString());
            token.setUser(user);
            token.setExpiresAt(LocalDateTime.now().plusHours(1));
            passwordResetTokenRepository.save(token);

            // build the full link here
            String resetLink = baseUrl + "/api/auth/reset-password?token=" + token.getToken();

            emailService.sendPasswordResetEmail(
                    user.getEmail(),
                    user.getUsername(),
                    resetLink
            );
        });
    }

    // called when user submits new password
    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository
                .findByToken(token)
                .orElseThrow(() -> new InvalidTokenException("Invalid reset token"));

        if (resetToken.isUsed()) {
            throw new InvalidTokenException("Token already used");
        }

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidTokenException("Reset token expired");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        // revoke all refresh tokens for security
        // (someone else might have used the reset)
    }
}