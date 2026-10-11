package com.parking.service;

import com.parking.dto.PagedResponse;
import com.parking.dto.UserDto;
import com.parking.exception.AppException;
import com.parking.model.User;
import com.parking.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final AuthService authService;
    private final AuditService auditService;

    public UserService(UserRepository userRepository, AuthService authService, AuditService auditService) {
        this.userRepository = userRepository;
        this.authService = authService;
        this.auditService = auditService;
    }

    public PagedResponse<UserDto> getUsers(String query, Pageable pageable) {
        Page<User> page;
        if (query != null && !query.isBlank()) {
            page = userRepository.findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(query.trim(), query.trim(), pageable);
        } else {
            page = userRepository.findAll(pageable);
        }

        return PagedResponse.<UserDto>builder()
                .content(page.getContent().stream().map(authService::mapToDto).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    public UserDto getUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("User not found with id: " + id));
        return authService.mapToDto(user);
    }

    public UserDto setUserActiveStatus(String id, boolean active, String adminId) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("User not found with id: " + id));

        user.setActive(active);
        user.setUpdatedAt(Instant.now());
        User updated = userRepository.save(user);

        String action = active ? "USER_ACTIVATED" : "USER_DEACTIVATED";
        auditService.log(adminId, action, "User", updated.getId(), Map.of("email", updated.getEmail()));

        return authService.mapToDto(updated);
    }
}
