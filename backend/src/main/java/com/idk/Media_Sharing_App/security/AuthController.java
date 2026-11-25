package com.idk.Media_Sharing_App.security;

import com.idk.Media_Sharing_App.user.User;
import com.idk.Media_Sharing_App.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final RefreshTokenService refreshTokenService;
    private final AuthService authService;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtUtil jwtUtil,
                          UserRepository userRepository,
                          RefreshTokenService refreshTokenService,
                          AuthService authService) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.refreshTokenService = refreshTokenService;
        this.authService = authService;
    }

    // GET /api/auth/verify-email?token=...
    @GetMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(
            @RequestParam String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok(Map.of("message", "Email verified successfully"));
    }

    // POST /api/auth/forgot-password
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @RequestBody @Valid ForgotPasswordRequest request) {
        authService.sendPasswordResetEmail(request.email());
        // always return success to prevent email enumeration
        return ResponseEntity.ok(Map.of("message",
                "If that email exists, a reset link has been sent"));
    }

    // POST /api/auth/reset-password
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @RequestBody @Valid ResetPasswordRequest request) {
        authService.resetPassword(request.token(), request.newPassword());
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid LoginRequest request) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.email(),
                            request.password()
                    )
            );

            User user = userRepository.findByEmail(request.email()).get();

            // FIX [Medium]: check email verification BEFORE creating a refresh token
            if (!user.isEmailVerified()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error",
                                "Email not verified. Check your inbox for the verification link."));
            }

            String accessToken = jwtUtil.generateToken(user.getId(), user.getEmail());
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

            return ResponseEntity.ok(new LoginResponse(
                    accessToken,
                    refreshToken.getToken(),
                    user.getId(),
                    user.getUsername(),
                    user.getEmail()
            ));

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid email or password"));
        }
    }

    // POST /api/auth/refresh
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> body) {
        String token = body.get("refreshToken");
        if (token == null || token.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "refreshToken is required"));
        }

        // FIX [High]: rotate the refresh token on every use to prevent replay attacks
        RefreshToken oldRefreshToken = refreshTokenService.validateRefreshToken(token);
        User user = oldRefreshToken.getUser();

        // revoke old token and issue a fresh one
        refreshTokenService.revokeRefreshToken(token);
        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user);

        String newAccessToken = jwtUtil.generateToken(user.getId(), user.getEmail());

        return ResponseEntity.ok(Map.of(
                "token", newAccessToken,
                "refreshToken", newRefreshToken.getToken()   // rotated
        ));
    }

    // POST /api/auth/logout
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody Map<String, String> body) {
        String token = body.get("refreshToken");
        if (token != null) {
            refreshTokenService.revokeRefreshToken(token);
        }
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}
