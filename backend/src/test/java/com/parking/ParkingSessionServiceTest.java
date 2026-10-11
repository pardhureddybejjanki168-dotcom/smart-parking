package com.parking;

import com.parking.dto.ParkingEntryRequest;
import com.parking.dto.ParkingRecordDto;
import com.parking.exception.AppException;
import com.parking.model.ParkingRecord;
import com.parking.model.ParkingSlot;
import com.parking.model.Role;
import com.parking.model.SessionStatus;
import com.parking.model.SlotStatus;
import com.parking.model.SlotType;
import com.parking.model.Vehicle;
import com.parking.model.VehicleType;
import com.parking.repository.ParkingRecordRepository;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.VehicleRepository;
import com.parking.service.AuditService;
import com.parking.service.NotificationService;
import com.parking.service.ParkingSessionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ParkingSessionServiceTest {

    @Mock
    private ParkingRecordRepository parkingRecordRepository;

    @Mock
    private ParkingSlotRepository parkingSlotRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private ParkingSessionService parkingSessionService;

    private Vehicle sampleVehicle;
    private ParkingSlot sampleSlot;
    private ParkingRecord sampleRecord;

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

        sampleRecord = ParkingRecord.builder()
                .id("rec-123")
                .vehicleId("veh-123")
                .vehicleNumber("KA-01-AB-1234")
                .slotId("slot-123")
                .slotNumber("F01")
                .userId("user-123")
                .entryTime(Instant.now().minusSeconds(3600))
                .status(SessionStatus.ACTIVE)
                .build();
    }

    @Test
    void testEntrySuccess() {
        ParkingEntryRequest request = ParkingEntryRequest.builder()
                .vehicleId("veh-123")
                .build();

        when(vehicleRepository.findById("veh-123")).thenReturn(Optional.of(sampleVehicle));
        when(parkingRecordRepository.findFirstByVehicleIdAndStatus("veh-123", SessionStatus.ACTIVE)).thenReturn(Optional.empty());
        when(parkingSlotRepository.findByStatusAndSlotType(SlotStatus.AVAILABLE, SlotType.FOUR_WHEELER)).thenReturn(List.of(sampleSlot));
        when(parkingRecordRepository.save(any(ParkingRecord.class))).thenReturn(sampleRecord);

        ParkingRecordDto result = parkingSessionService.entry(request, "user-123");

        assertNotNull(result);
        assertEquals("F01", result.getSlotNumber());
        assertEquals(SessionStatus.ACTIVE, result.getStatus());
        verify(parkingSlotRepository).save(any(ParkingSlot.class));
    }

    @Test
    void testEntryNoAvailableSlot() {
        ParkingEntryRequest request = ParkingEntryRequest.builder()
                .vehicleId("veh-123")
                .build();

        when(vehicleRepository.findById("veh-123")).thenReturn(Optional.of(sampleVehicle));
        when(parkingRecordRepository.findFirstByVehicleIdAndStatus("veh-123", SessionStatus.ACTIVE)).thenReturn(Optional.empty());
        when(parkingSlotRepository.findByStatusAndSlotType(SlotStatus.AVAILABLE, SlotType.FOUR_WHEELER)).thenReturn(Collections.emptyList());

        assertThrows(AppException.class, () -> parkingSessionService.entry(request, "user-123"));
    }

    @Test
    void testEntryVehicleAlreadyParked() {
        ParkingEntryRequest request = ParkingEntryRequest.builder()
                .vehicleId("veh-123")
                .build();

        when(vehicleRepository.findById("veh-123")).thenReturn(Optional.of(sampleVehicle));
        when(parkingRecordRepository.findFirstByVehicleIdAndStatus("veh-123", SessionStatus.ACTIVE))
                .thenReturn(Optional.of(sampleRecord));

        assertThrows(AppException.class, () -> parkingSessionService.entry(request, "user-123"));
    }

    @Test
    void testExitSuccess() {
        when(parkingRecordRepository.findById("rec-123")).thenReturn(Optional.of(sampleRecord));
        when(parkingSlotRepository.findById("slot-123")).thenReturn(Optional.of(sampleSlot));
        when(parkingRecordRepository.save(any(ParkingRecord.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ParkingRecordDto result = parkingSessionService.exit("rec-123", "user-123", Role.USER);

        assertNotNull(result);
        assertEquals(SessionStatus.COMPLETED, result.getStatus());
        assertNotNull(result.getExitTime());
        verify(parkingSlotRepository).save(any(ParkingSlot.class));
    }

    @Test
    void testExitAlreadyCompleted() {
        sampleRecord.setStatus(SessionStatus.COMPLETED);
        when(parkingRecordRepository.findById("rec-123")).thenReturn(Optional.of(sampleRecord));

        assertThrows(AppException.class, () -> parkingSessionService.exit("rec-123", "user-123", Role.USER));
    }
}
