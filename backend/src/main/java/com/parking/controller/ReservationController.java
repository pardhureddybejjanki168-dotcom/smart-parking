package com.parking.controller;

import com.parking.dto.ApiResponse;
import com.parking.dto.PagedResponse;
import com.parking.dto.ReservationDto;
import com.parking.dto.ReservationRequest;
import com.parking.security.UserPrincipal;
import com.parking.service.ReservationService;
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

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReservationDto>> createReservation(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ReservationRequest request) {
        ReservationDto reservation = reservationService.create(request, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Reservation confirmed successfully", reservation));
    }

    @GetMapping
    public ResponseEntity<PagedResponse<ReservationDto>> getUserReservations(
            @AuthenticationPrincipal UserPrincipal principal,
            @PageableDefault(sort = "startTime", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(reservationService.getUserReservations(principal.getId(), pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReservationDto>> getReservation(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        ReservationDto dto = reservationService.getReservation(id, principal.getId(), principal.getRole());
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<ReservationDto>> cancelReservation(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        ReservationDto cancelled = reservationService.cancel(id, principal.getId(), principal.getRole());
        return ResponseEntity.ok(ApiResponse.ok("Reservation cancelled successfully", cancelled));
    }
}
