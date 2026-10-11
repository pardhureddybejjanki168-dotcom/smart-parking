package com.parking;

import com.parking.dto.AuthResponse;
import com.parking.dto.LoginRequest;
import com.parking.dto.RegisterRequest;
import com.parking.exception.AppException;
import com.parking.model.Role;
import com.parking.model.User;
import com.parking.repository.UserRepository;
import com.parking.security.JwtUtil;
import com.parking.service.AuditService;
import com.parking.service.AuthService;
import com.parking.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private NotificationService notificationService;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id("user-123")
                .fullName("Test User")
                .email("test@example.com")
                .normalizedEmail("test@example.com")
                .phone("+1234567890")
                .passwordHash("encoded_secret")
                .role(Role.USER)
                .active(true)
                .build();
    }

    @Test
    void testRegisterSuccess() {
        RegisterRequest request = RegisterRequest.builder()
                .fullName("Test User")
                .email("test@example.com")
                .phone("+1234567890")
                .password("Password123")
                .confirmPassword("Password123")
                .build();

        when(userRepository.existsByNormalizedEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Password123")).thenReturn("encoded_secret");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(jwtUtil.generateToken(any())).thenReturn("sample.jwt.token");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("sample.jwt.token", response.getToken());
        assertEquals("test@example.com", response.getUser().getEmail());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void testRegisterDuplicateEmail() {
        RegisterRequest request = RegisterRequest.builder()
                .fullName("Test User")
                .email("test@example.com")
                .phone("+1234567890")
                .password("Password123")
                .confirmPassword("Password123")
                .build();

        when(userRepository.existsByNormalizedEmail("test@example.com")).thenReturn(true);

        assertThrows(AppException.class, () -> authService.register(request));
    }

    @Test
    void testLoginSuccess() {
        LoginRequest request = LoginRequest.builder()
                .email("test@example.com")
                .password("Password123")
                .build();

        when(userRepository.findByNormalizedEmail("test@example.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("Password123", "encoded_secret")).thenReturn(true);
        when(jwtUtil.generateToken(any())).thenReturn("sample.jwt.token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("sample.jwt.token", response.getToken());
        assertEquals("test@example.com", response.getUser().getEmail());
    }

    @Test
    void testLoginInvalidPassword() {
        LoginRequest request = LoginRequest.builder()
                .email("test@example.com")
                .password("WrongPassword")
                .build();

        when(userRepository.findByNormalizedEmail("test@example.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("WrongPassword", "encoded_secret")).thenReturn(false);

        assertThrows(AppException.class, () -> authService.login(request));
    }
}
