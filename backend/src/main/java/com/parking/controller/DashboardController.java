package com.parking.controller;

import com.parking.dto.ApiResponse;
import com.parking.dto.DashboardAdminDto;
import com.parking.dto.DashboardUserDto;
import com.parking.security.UserPrincipal;
import com.parking.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/user")
    public ResponseEntity<ApiResponse<DashboardUserDto>> getUserDashboard(
            @AuthenticationPrincipal UserPrincipal principal) {
        DashboardUserDto dashboard = dashboardService.getUserDashboard(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(dashboard));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DashboardAdminDto>> getAdminDashboard() {
        DashboardAdminDto dashboard = dashboardService.getAdminDashboard();
        return ResponseEntity.ok(ApiResponse.ok(dashboard));
    }
}
