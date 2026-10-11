package com.parking.controller;

import com.parking.dto.ApiResponse;
import com.parking.dto.PagedResponse;
import com.parking.dto.VehicleDto;
import com.parking.dto.VehicleRequest;
import com.parking.model.Role;
import com.parking.security.UserPrincipal;
import com.parking.service.VehicleService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @GetMapping
    public ResponseEntity<PagedResponse<VehicleDto>> getVehicles(
            @AuthenticationPrincipal UserPrincipal principal,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        if (principal.getRole() == Role.ADMIN) {
            return ResponseEntity.ok(vehicleService.getAllVehicles(pageable));
        }
        return ResponseEntity.ok(vehicleService.getVehiclesForUser(principal.getId(), pageable));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<VehicleDto>> createVehicle(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody VehicleRequest request) {
        VehicleDto created = vehicleService.createVehicle(request, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Vehicle created successfully", created));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleDto>> getVehicle(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        VehicleDto dto = vehicleService.getVehicle(id, principal.getId(), principal.getRole());
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleDto>> updateVehicle(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id,
            @Valid @RequestBody VehicleRequest request) {
        VehicleDto updated = vehicleService.updateVehicle(id, request, principal.getId(), principal.getRole());
        return ResponseEntity.ok(ApiResponse.ok("Vehicle updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deactivateVehicle(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        vehicleService.deactivateVehicle(id, principal.getId(), principal.getRole());
        return ResponseEntity.ok(ApiResponse.ok("Vehicle deactivated successfully", null));
    }
}
