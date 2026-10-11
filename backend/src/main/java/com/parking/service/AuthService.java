package com.parking.service;

import com.parking.dto.AuthResponse;
import com.parking.dto.LoginRequest;
import com.parking.dto.RegisterRequest;
import com.parking.dto.UserDto;
import com.parking.exception.AppException;
import com.parking.model.Role;
import com.parking.model.User;
import com.parking.repository.UserRepository;
import com.parking.security.JwtUtil;
import com.parking.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil, NotificationService notificationService, AuditService auditService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (request.getConfirmPassword() != null && !request.getPassword().equals(request.getConfirmPassword())) {
            throw AppException.badRequest("Passwords do not match");
        }

        String normalizedEmail = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByNormalizedEmail(normalizedEmail)) {
            throw AppException.conflict("Email is already registered");
        }

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(request.getEmail().trim())
                .normalizedEmail(normalizedEmail)
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .active(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        User savedUser = userRepository.save(user);

        // Welcome notification
        notificationService.create(
                savedUser.getId(),
                "Welcome to Parking System",
                "Your account has been registered successfully. Welcome aboard!",
                "SYSTEM"
        );

        auditService.log(savedUser.getId(), "USER_REGISTER", "User", savedUser.getId(),
                Map.of("email", savedUser.getEmail()));

        UserPrincipal principal = UserPrincipal.create(savedUser);
        String token = jwtUtil.generateToken(principal);

        return AuthResponse.builder()
                .token(token)
                .user(mapToDto(savedUser))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByNormalizedEmail(normalizedEmail)
                .orElseThrow(() -> AppException.unauthorized("Invalid email or password"));

        if (!user.isActive()) {
            throw AppException.forbidden("Your account is deactivated. Please contact support.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw AppException.unauthorized("Invalid email or password");
        }

        UserPrincipal principal = UserPrincipal.create(user);
        String token = jwtUtil.generateToken(principal);

        auditService.log(user.getId(), "USER_LOGIN", "User", user.getId(),
                Map.of("email", user.getEmail()));

        return AuthResponse.builder()
                .token(token)
                .user(mapToDto(user))
                .build();
    }

    public UserDto getCurrentUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> AppException.notFound("User not found with id: " + userId));
        return mapToDto(user);
    }

    public UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
