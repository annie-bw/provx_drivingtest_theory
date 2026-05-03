package com.provx.driving_test.services;

import com.provx.driving_test.dtos.request.LoginRequest;
import com.provx.driving_test.dtos.request.RegisterRequest;
import com.provx.driving_test.dtos.response.AuthResponse;
import com.provx.driving_test.enums.Role;
import com.provx.driving_test.exceptions.ApiException;
import com.provx.driving_test.models.User;
import com.provx.driving_test.Repository.UserRepository;
import com.provx.driving_test.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;   // ← delegates JWT work here, no circular dep

    // ─── Register ───────────────────
    // ──────────────────────────────────────────

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw ApiException.conflict("Email already in use");
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT)
                .isActive(true)
                .build();

        userRepository.save(user);

        String token = jwtService.generateToken(user);
        return buildAuthResponse(user, token);
    }

    // ─── Login ────────────────────────────────────────────────────────────────

    public AuthResponse login(LoginRequest request) {
        // This will throw BadCredentialsException (→ 401) if wrong email/password
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> ApiException.notFound("User", request.getEmail()));

        if (!user.getIsActive()) {
            throw ApiException.forbidden("Your account has been deactivated");
        }

        String token = jwtService.generateToken(user);
        return buildAuthResponse(user, token);
    }

    // ─── Internal helper ──────────────────────────────────────────────────────

    private AuthResponse buildAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}