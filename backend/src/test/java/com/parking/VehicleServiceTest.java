package com.parking;

import com.parking.dto.VehicleDto;
import com.parking.dto.VehicleRequest;
import com.parking.exception.AppException;
import com.parking.model.Role;
import com.parking.model.Vehicle;
import com.parking.model.VehicleType;
import com.parking.repository.ParkingRecordRepository;
import com.parking.repository.VehicleRepository;
import com.parking.service.AuditService;
import com.parking.service.VehicleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VehicleServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private ParkingRecordRepository parkingRecordRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private VehicleService vehicleService;

    private Vehicle sampleVehicle;

    @BeforeEach
    void setUp() {
        sampleVehicle = Vehicle.builder()
                .id("veh-123")
                .registrationNumber("KA-01-AB-1234")
                .normalizedRegistrationNumber("KA01AB1234")
                .vehicleType(VehicleType.FOUR_WHEELER)
                .make("Toyota")
                .model("Camry")
                .color("Black")
                .ownerName("John Doe")
                .ownerPhone("+1234567890")
                .userId("user-123")
                .active(true)
                .build();
    }

    @Test
    void testCreateVehicleSuccess() {
        VehicleRequest request = VehicleRequest.builder()
                .registrationNumber("KA-01-AB-1234")
                .vehicleType(VehicleType.FOUR_WHEELER)
                .make("Toyota")
                .model("Camry")
                .color("Black")
                .ownerName("John Doe")
                .ownerPhone("+1234567890")
                .build();

        when(vehicleRepository.existsByNormalizedRegistrationNumber("KA01AB1234")).thenReturn(false);
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(sampleVehicle);

        VehicleDto result = vehicleService.createVehicle(request, "user-123");

        assertNotNull(result);
        assertEquals("KA-01-AB-1234", result.getRegistrationNumber());
        assertEquals(VehicleType.FOUR_WHEELER, result.getVehicleType());
        verify(vehicleRepository).save(any(Vehicle.class));
    }

    @Test
    void testCreateVehicleDuplicateRegistration() {
        VehicleRequest request = VehicleRequest.builder()
                .registrationNumber("KA-01-AB-1234")
                .vehicleType(VehicleType.FOUR_WHEELER)
                .build();

        when(vehicleRepository.existsByNormalizedRegistrationNumber("KA01AB1234")).thenReturn(true);

        assertThrows(AppException.class, () -> vehicleService.createVehicle(request, "user-123"));
    }

    @Test
    void testGetVehicleUnauthorized() {
        when(vehicleRepository.findById("veh-123")).thenReturn(Optional.of(sampleVehicle));

        assertThrows(AppException.class, () -> vehicleService.getVehicle("veh-123", "different-user", Role.USER));
    }
}
