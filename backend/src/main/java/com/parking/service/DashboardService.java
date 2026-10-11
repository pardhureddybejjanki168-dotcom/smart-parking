package com.parking.service;

import com.parking.dto.DashboardAdminDto;
import com.parking.dto.DashboardUserDto;
import com.parking.model.SessionStatus;
import com.parking.model.SlotStatus;
import com.parking.repository.ParkingRecordRepository;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.UserRepository;
import com.parking.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class DashboardService {

    private final ParkingSlotRepository parkingSlotRepository;
    private final ParkingRecordRepository parkingRecordRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;

    public DashboardService(ParkingSlotRepository parkingSlotRepository,
                            ParkingRecordRepository parkingRecordRepository,
                            VehicleRepository vehicleRepository,
                            UserRepository userRepository) {
        this.parkingSlotRepository = parkingSlotRepository;
        this.parkingRecordRepository = parkingRecordRepository;
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
    }

    public DashboardUserDto getUserDashboard(String userId) {
        long totalSlots = parkingSlotRepository.count();
        long availableSlots = parkingSlotRepository.countByStatus(SlotStatus.AVAILABLE);
        long occupiedSlots = parkingSlotRepository.countByStatus(SlotStatus.OCCUPIED);
        long reservedSlots = parkingSlotRepository.countByStatus(SlotStatus.RESERVED);

        long userActiveSessions = parkingRecordRepository.countByUserIdAndStatus(userId, SessionStatus.ACTIVE);
        long userVehicles = vehicleRepository.countByUserId(userId);

        return DashboardUserDto.builder()
                .totalSlots(totalSlots)
                .availableSlots(availableSlots)
                .occupiedSlots(occupiedSlots)
                .reservedSlots(reservedSlots)
                .userActiveSessions(userActiveSessions)
                .userVehicles(userVehicles)
                .build();
    }

    public DashboardAdminDto getAdminDashboard() {
        long totalUsers = userRepository.count();
        long totalVehicles = vehicleRepository.count();
        long totalSlots = parkingSlotRepository.count();
        long availableSlots = parkingSlotRepository.countByStatus(SlotStatus.AVAILABLE);
        long occupiedSlots = parkingSlotRepository.countByStatus(SlotStatus.OCCUPIED);
        long reservedSlots = parkingSlotRepository.countByStatus(SlotStatus.RESERVED);
        long activeSessions = parkingRecordRepository.countByStatus(SessionStatus.ACTIVE);

        Instant startOfToday = Instant.now().truncatedTo(ChronoUnit.DAYS);
        Instant endOfToday = startOfToday.plus(1, ChronoUnit.DAYS);
        long completedToday = parkingRecordRepository.countByStatusAndExitTimeBetween(
                SessionStatus.COMPLETED, startOfToday, endOfToday);

        return DashboardAdminDto.builder()
                .totalUsers(totalUsers)
                .totalVehicles(totalVehicles)
                .totalSlots(totalSlots)
                .availableSlots(availableSlots)
                .occupiedSlots(occupiedSlots)
                .reservedSlots(reservedSlots)
                .activeSessions(activeSessions)
                .completedToday(completedToday)
                .build();
    }
}
