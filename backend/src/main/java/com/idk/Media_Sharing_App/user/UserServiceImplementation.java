package com.idk.Media_Sharing_App.user;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class UserServiceImplementation implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImplementation(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserProfileResponse getUserById(UUID id) {
        User user = userRepository.findById(id).orElseThrow(() -> new UserNotFoundException(id));
        return toProfileResponse(user);
    }

    @Override
    public List<UserProfileResponse> getAllUsers() {
        return userRepository.findAll().stream().map(this::toProfileResponse).toList();
    }

    @Override
    public UserProfileResponse updateUser(UUID id, UpdateUserRequest request) {
        User user = userRepository.findById(id).orElseThrow(() -> new UserNotFoundException(id));

        //
        //sec for later
        //

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

        // check email isn't taken
        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyExistsException(request.email());
        }

        // check username isn't taken
        if (userRepository.findByUsername(request.username()).isPresent()) {
            throw new UsernameAlreadyExistsException(request.username());
        }

        // hash the password
        String hashedPassword = passwordEncoder.encode(request.password());

        // build and save the user
        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPasswordHash(hashedPassword);
        // createdAt/updatedAt set automatically by @PrePersist

        User saved = userRepository.save(user);

        // return safe response
        return new AuthResponse(
                saved.getId(),
                saved.getUsername(),
                saved.getEmail()
        );
    }
}
