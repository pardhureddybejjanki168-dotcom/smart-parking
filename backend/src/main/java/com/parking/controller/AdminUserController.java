package com.parking.controller;

import com.parking.dto.ApiResponse;
import com.parking.dto.PagedResponse;
import com.parking.dto.UserDto;
import com.parking.security.UserPrincipal;
import com.parking.service.UserService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<PagedResponse<UserDto>> getUsers(
            @RequestParam(required = false) String q,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(userService.getUsers(q, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto>> getUser(@PathVariable String id) {
        UserDto userDto = userService.getUser(id);
        return ResponseEntity.ok(ApiResponse.ok(userDto));
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<UserDto>> activateUser(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        UserDto user = userService.setUserActiveStatus(id, true, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("User activated successfully", user));
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<UserDto>> deactivateUser(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        UserDto user = userService.setUserActiveStatus(id, false, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("User deactivated successfully", user));
    }
}
