package com.idk.Media_Sharing_App.user;

import java.util.List;
import java.util.UUID;

public interface UserService {
    AuthResponse register(RegisterRequest request);
    UserProfileResponse getUserById(UUID id);
    List<UserProfileResponse> getAllUsers();
    UserProfileResponse updateUser(UUID id, UpdateUserRequest request);
    void deleteUser(UUID id);
}
