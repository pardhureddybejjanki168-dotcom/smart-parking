package com.parking.controller;

import com.parking.dto.ApiResponse;
import com.parking.dto.PagedResponse;
import com.parking.dto.ParkingRecordDto;
import com.parking.service.ParkingSessionService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/parking-sessions")
@PreAuthorize("hasRole('ADMIN')")
public class AdminSessionController {

    private final ParkingSessionService parkingSessionService;

    public AdminSessionController(ParkingSessionService parkingSessionService) {
        this.parkingSessionService = parkingSessionService;
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<ParkingRecordDto>>> getAllActiveSessions() {
        List<ParkingRecordDto> activeSessions = parkingSessionService.getAllActiveSessions();
        return ResponseEntity.ok(ApiResponse.ok(activeSessions));
    }

    @GetMapping("/history")
    public ResponseEntity<PagedResponse<ParkingRecordDto>> getAllHistory(
            @PageableDefault(sort = "entryTime", direction = Sort.Direction.DESC) Pageable pageable) {
        PagedResponse<ParkingRecordDto> response = parkingSessionService.getAllHistory(pageable);
        return ResponseEntity.ok(response);
    }
}
