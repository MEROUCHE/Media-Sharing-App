package com.idk.Media_Sharing_App.user;

import com.idk.Media_Sharing_App.exception.ForbiddenException;
import com.idk.Media_Sharing_App.security.AuthService;
import com.idk.Media_Sharing_App.security.SecurityUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserServiceImplementation implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;

    public UserServiceImplementation(UserRepository userRepository, PasswordEncoder passwordEncoder, AuthService authService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authService = authService;
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getUserById(UUID id) {
        User user = userRepository.findById(id).orElseThrow(() -> new UserNotFoundException(id));
        return toProfileResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserProfileResponse> getAllUsers() {
        return userRepository.findAll().stream().map(this::toProfileResponse).toList();
    }

    @Override
    public UserProfileResponse updateUser(UUID id, UpdateUserRequest request) {

        UUID currentUserId = SecurityUtils.getCurrentUserId();

        if (!currentUserId.equals(id)) {
            throw new ForbiddenException("Cannot update another user's profile");
        }

        User user = userRepository.findById(id).orElseThrow(() -> new UserNotFoundException(id));


        if (request.username() != null && !request.username().isBlank()) {
            user.setUsername(request.username());
        }
        if (request.avatarUrl() != null) {
            user.setAvatarUrl(request.avatarUrl());
        }

        User saved = userRepository.save(user);
        return toProfileResponse(saved);
    }

    @Override
    public void deleteUser(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new UserNotFoundException(id);
        }
        userRepository.deleteById(id);
    }



    private UserProfileResponse toProfileResponse(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getAvatarUrl(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyExistsException(request.email());
        }
        if (userRepository.findByUsername(request.username()).isPresent()) {
            throw new UsernameAlreadyExistsException(request.username());
        }

        String hashedPassword = passwordEncoder.encode(request.password());
        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPasswordHash(hashedPassword);
        user.setEmailVerified(false);  // ← starts unverified

        User saved = userRepository.save(user);

        // send verification email
        authService.sendVerificationEmail(saved);  // ← NEW

        return new AuthResponse(saved.getId(), saved.getUsername(), saved.getEmail());
    }
}
