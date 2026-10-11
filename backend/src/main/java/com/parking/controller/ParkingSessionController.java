package com.parking.controller;

import com.parking.dto.ApiResponse;
import com.parking.dto.PagedResponse;
import com.parking.dto.ParkingEntryRequest;
import com.parking.dto.ParkingRecordDto;
import com.parking.security.UserPrincipal;
import com.parking.service.ParkingSessionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/parking-sessions")
public class ParkingSessionController {

    private final ParkingSessionService parkingSessionService;

    public ParkingSessionController(ParkingSessionService parkingSessionService) {
        this.parkingSessionService = parkingSessionService;
    }

    @PostMapping("/entry")
    public ResponseEntity<ApiResponse<ParkingRecordDto>> entry(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ParkingEntryRequest request) {
        ParkingRecordDto record = parkingSessionService.entry(request, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Parking entry successful", record));
    }

    @PostMapping("/{id}/exit")
    public ResponseEntity<ApiResponse<ParkingRecordDto>> exit(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        ParkingRecordDto record = parkingSessionService.exit(id, principal.getId(), principal.getRole());
        return ResponseEntity.ok(ApiResponse.ok("Parking exit successful", record));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<ParkingRecordDto>>> getActiveSessions(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<ParkingRecordDto> sessions = parkingSessionService.getActiveSessions(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(sessions));
    }

    @GetMapping("/history")
    public ResponseEntity<PagedResponse<ParkingRecordDto>> getHistory(
            @AuthenticationPrincipal UserPrincipal principal,
            @PageableDefault(sort = "entryTime", direction = Sort.Direction.DESC) Pageable pageable) {
        PagedResponse<ParkingRecordDto> response = parkingSessionService.getHistory(principal.getId(), pageable);
        return ResponseEntity.ok(response);
    }
}
