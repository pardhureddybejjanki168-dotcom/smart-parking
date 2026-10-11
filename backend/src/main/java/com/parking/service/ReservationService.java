package com.parking.service;

import com.parking.dto.PagedResponse;
import com.parking.dto.ReservationDto;
import com.parking.dto.ReservationRequest;
import com.parking.exception.AppException;
import com.parking.model.ParkingSlot;
import com.parking.model.Reservation;
import com.parking.model.ReservationStatus;
import com.parking.model.Role;
import com.parking.model.Vehicle;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.ReservationRepository;
import com.parking.repository.VehicleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class ReservationService {

    private static final Logger log = LoggerFactory.getLogger(ReservationService.class);

    private final ReservationRepository reservationRepository;
    private final VehicleRepository vehicleRepository;
    private final ParkingSlotRepository parkingSlotRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public ReservationService(ReservationRepository reservationRepository,
                              VehicleRepository vehicleRepository,
                              ParkingSlotRepository parkingSlotRepository,
                              NotificationService notificationService,
                              AuditService auditService) {
        this.reservationRepository = reservationRepository;
        this.vehicleRepository = vehicleRepository;
        this.parkingSlotRepository = parkingSlotRepository;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }

    public ReservationDto create(ReservationRequest request, String userId) {
        // 1. Verify vehicle ownership
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> AppException.notFound("Vehicle not found with id: " + request.getVehicleId()));

        if (!vehicle.getUserId().equals(userId)) {
            throw AppException.forbidden("You do not own this vehicle");
        }

        if (!vehicle.isActive()) {
            throw AppException.badRequest("Vehicle is inactive");
        }

        // Verify slot exists
        ParkingSlot slot = parkingSlotRepository.findById(request.getSlotId())
                .orElseThrow(() -> AppException.notFound("Parking slot not found with id: " + request.getSlotId()));

        // 2. Validate startTime < endTime, duration >= 15min
        if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().equals(request.getEndTime())) {
            throw AppException.badRequest("Reservation start time must be before end time");
        }

        // Allow a 15-minute clock drift/buffer in past check
        if (request.getStartTime().isBefore(Instant.now().minus(Duration.ofMinutes(15)))) {
            throw AppException.badRequest("Reservation start time cannot be in the past");
        }

        Duration duration = Duration.between(request.getStartTime(), request.getEndTime());
        if (duration.toMinutes() < 15) {
            throw AppException.badRequest("Reservation duration must be at least 15 minutes");
        }

        // 3. Check conflicting reservation for slot in time window
        List<Reservation> existingReservations = reservationRepository.findBySlotIdAndStatusIn(
                slot.getId(),
                List.of(ReservationStatus.CONFIRMED, ReservationStatus.PENDING)
        );

        boolean hasConflict = existingReservations.stream().anyMatch(r ->
                request.getStartTime().isBefore(r.getEndTime()) && r.getStartTime().isBefore(request.getEndTime())
        );

        if (hasConflict) {
            throw AppException.conflict("Slot is already reserved for the selected time window");
        }

        // 4. Create reservation with status CONFIRMED
        Instant now = Instant.now();
        Reservation reservation = Reservation.builder()
                .userId(userId)
                .vehicleId(vehicle.getId())
                .slotId(slot.getId())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status(ReservationStatus.CONFIRMED)
                .createdAt(now)
                .updatedAt(now)
                .build();

        Reservation saved = reservationRepository.save(reservation);

        // 5. Notify user
        notificationService.create(
                userId,
                "Reservation Confirmed",
                String.format("Slot %s reserved for vehicle %s from %s to %s",
                        slot.getSlotNumber(), vehicle.getRegistrationNumber(), request.getStartTime(), request.getEndTime()),
                "RESERVATION_CONFIRMED"
        );

        auditService.log(userId, "RESERVATION_CREATED", "Reservation", saved.getId(),
                Map.of("slotNumber", slot.getSlotNumber(), "vehicleNumber", vehicle.getRegistrationNumber()));

        return mapToDto(saved);
    }

    public ReservationDto cancel(String id, String userId, Role role) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Reservation not found with id: " + id));

        if (role != Role.ADMIN && !reservation.getUserId().equals(userId)) {
            throw AppException.forbidden("Not authorized to cancel this reservation");
        }

        if (reservation.getStatus() != ReservationStatus.CONFIRMED && reservation.getStatus() != ReservationStatus.PENDING) {
            throw AppException.badRequest("Only active reservations (CONFIRMED or PENDING) can be cancelled");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        reservation.setUpdatedAt(Instant.now());
        Reservation saved = reservationRepository.save(reservation);

        notificationService.create(
                reservation.getUserId(),
                "Reservation Cancelled",
                "Your reservation " + id + " has been cancelled",
                "RESERVATION_CANCELLED"
        );

        auditService.log(userId, "RESERVATION_CANCELLED", "Reservation", saved.getId(), Map.of());

        return mapToDto(saved);
    }

    public ReservationDto getReservation(String id, String userId, Role role) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Reservation not found with id: " + id));

        if (role != Role.ADMIN && !reservation.getUserId().equals(userId)) {
            throw AppException.forbidden("Not authorized to view this reservation");
        }

        return mapToDto(reservation);
    }

    public PagedResponse<ReservationDto> getUserReservations(String userId, Pageable pageable) {
        Page<Reservation> page = reservationRepository.findByUserId(userId, pageable);
        return PagedResponse.<ReservationDto>builder()
                .content(page.getContent().stream().map(this::mapToDto).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getContent().isEmpty() ? 0 : page.getTotalPages())
                .build();
    }

    public PagedResponse<ReservationDto> getAllReservations(Pageable pageable) {
        Page<Reservation> page = reservationRepository.findAll(pageable);
        return PagedResponse.<ReservationDto>builder()
                .content(page.getContent().stream().map(this::mapToDto).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getContent().isEmpty() ? 0 : page.getTotalPages())
                .build();
    }

    @Scheduled(fixedRate = 300000) // Every 5 minutes
    public void expireOldReservations() {
        log.info("Running scheduled task to expire overdue reservations...");
        Instant now = Instant.now();
        List<Reservation> expiredReservations = reservationRepository.findByStatusAndEndTimeBefore(ReservationStatus.CONFIRMED, now);
        for (Reservation r : expiredReservations) {
            r.setStatus(ReservationStatus.EXPIRED);
            r.setUpdatedAt(now);
            reservationRepository.save(r);
            log.info("Reservation {} expired", r.getId());
        }
    }

    public ReservationDto mapToDto(Reservation reservation) {
        return ReservationDto.builder()
                .id(reservation.getId())
                .userId(reservation.getUserId())
                .vehicleId(reservation.getVehicleId())
                .slotId(reservation.getSlotId())
                .startTime(reservation.getStartTime())
                .endTime(reservation.getEndTime())
                .status(reservation.getStatus())
                .createdAt(reservation.getCreatedAt())
                .updatedAt(reservation.getUpdatedAt())
                .build();
    }
}
