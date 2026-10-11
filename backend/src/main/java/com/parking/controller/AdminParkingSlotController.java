package com.parking.controller;

import com.parking.dto.ApiResponse;
import com.parking.dto.ParkingSlotDto;
import com.parking.dto.ParkingSlotRequest;
import com.parking.dto.UpdateSlotStatusRequest;
import com.parking.security.UserPrincipal;
import com.parking.service.ParkingSlotService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/parking-slots")
@PreAuthorize("hasRole('ADMIN')")
public class AdminParkingSlotController {

    private final ParkingSlotService parkingSlotService;

    public AdminParkingSlotController(ParkingSlotService parkingSlotService) {
        this.parkingSlotService = parkingSlotService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ParkingSlotDto>> createSlot(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ParkingSlotRequest request) {
        ParkingSlotDto slot = parkingSlotService.createSlot(request, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Parking slot created successfully", slot));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ParkingSlotDto>> updateSlot(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id,
            @Valid @RequestBody ParkingSlotRequest request) {
        ParkingSlotDto slot = parkingSlotService.updateSlot(id, request, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Parking slot updated successfully", slot));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ParkingSlotDto>> updateSlotStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id,
            @Valid @RequestBody UpdateSlotStatusRequest request) {
        ParkingSlotDto slot = parkingSlotService.updateSlotStatus(id, request.getStatus(), principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Parking slot status updated successfully", slot));
    }
}
