package com.parking;

import com.parking.dto.ReservationDto;
import com.parking.dto.ReservationRequest;
import com.parking.exception.AppException;
import com.parking.model.ParkingSlot;
import com.parking.model.Reservation;
import com.parking.model.ReservationStatus;
import com.parking.model.Role;
import com.parking.model.SlotStatus;
import com.parking.model.SlotType;
import com.parking.model.Vehicle;
import com.parking.model.VehicleType;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.ReservationRepository;
import com.parking.repository.VehicleRepository;
import com.parking.service.AuditService;
import com.parking.service.NotificationService;
import com.parking.service.ReservationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private ParkingSlotRepository parkingSlotRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private ReservationService reservationService;

    private Vehicle sampleVehicle;
    private ParkingSlot sampleSlot;
    private Reservation sampleReservation;

    @BeforeEach
    void setUp() {
        sampleVehicle = Vehicle.builder()
                .id("veh-123")
                .registrationNumber("KA-01-AB-1234")
                .vehicleType(VehicleType.FOUR_WHEELER)
                .userId("user-123")
                .active(true)
                .build();

        sampleSlot = ParkingSlot.builder()
                .id("slot-123")
                .slotNumber("F01")
                .slotType(SlotType.FOUR_WHEELER)
                .status(SlotStatus.AVAILABLE)
                .build();

        Instant start = Instant.now().plus(1, ChronoUnit.HOURS);
        Instant end = start.plus(2, ChronoUnit.HOURS);

        sampleReservation = Reservation.builder()
                .id("res-123")
                .userId("user-123")
                .vehicleId("veh-123")
                .slotId("slot-123")
                .startTime(start)
                .endTime(end)
                .status(ReservationStatus.CONFIRMED)
                .build();
    }

    @Test
    void testCreateReservationSuccess() {
        Instant start = Instant.now().plus(1, ChronoUnit.HOURS);
        Instant end = start.plus(2, ChronoUnit.HOURS);

        ReservationRequest request = ReservationRequest.builder()
                .vehicleId("veh-123")
                .slotId("slot-123")
                .startTime(start)
                .endTime(end)
                .build();

        when(vehicleRepository.findById("veh-123")).thenReturn(Optional.of(sampleVehicle));
        when(parkingSlotRepository.findById("slot-123")).thenReturn(Optional.of(sampleSlot));
        when(reservationRepository.findBySlotIdAndStatusIn(eq("slot-123"), anyList())).thenReturn(Collections.emptyList());
        when(reservationRepository.save(any(Reservation.class))).thenReturn(sampleReservation);

        ReservationDto result = reservationService.create(request, "user-123");

        assertNotNull(result);
        assertEquals(ReservationStatus.CONFIRMED, result.getStatus());
        verify(reservationRepository).save(any(Reservation.class));
    }

    @Test
    void testCreateReservationConflict() {
        Instant start = Instant.now().plus(1, ChronoUnit.HOURS);
        Instant end = start.plus(2, ChronoUnit.HOURS);

        ReservationRequest request = ReservationRequest.builder()
                .vehicleId("veh-123")
                .slotId("slot-123")
                .startTime(start)
                .endTime(end)
                .build();

        Reservation conflicting = Reservation.builder()
                .id("res-conflict")
                .startTime(start.plus(30, ChronoUnit.MINUTES))
                .endTime(end.plus(30, ChronoUnit.MINUTES))
                .status(ReservationStatus.CONFIRMED)
                .build();

        when(vehicleRepository.findById("veh-123")).thenReturn(Optional.of(sampleVehicle));
        when(parkingSlotRepository.findById("slot-123")).thenReturn(Optional.of(sampleSlot));
        when(reservationRepository.findBySlotIdAndStatusIn(eq("slot-123"), anyList()))
                .thenReturn(List.of(conflicting));

        assertThrows(AppException.class, () -> reservationService.create(request, "user-123"));
    }

    @Test
    void testCancelReservationSuccess() {
        when(reservationRepository.findById("res-123")).thenReturn(Optional.of(sampleReservation));
        when(reservationRepository.save(any(Reservation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ReservationDto result = reservationService.cancel("res-123", "user-123", Role.USER);

        assertNotNull(result);
        assertEquals(ReservationStatus.CANCELLED, result.getStatus());
        verify(reservationRepository).save(any(Reservation.class));
    }
}
