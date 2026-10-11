package com.parking.service;

import com.parking.dto.PagedResponse;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ParkingSessionService {

    private static final Logger log = LoggerFactory.getLogger(ParkingSessionService.class);

    private final ParkingRecordRepository parkingRecordRepository;
    private final ParkingSlotRepository parkingSlotRepository;
    private final VehicleRepository vehicleRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public ParkingSessionService(ParkingRecordRepository parkingRecordRepository,
                                 ParkingSlotRepository parkingSlotRepository,
                                 VehicleRepository vehicleRepository,
                                 NotificationService notificationService,
                                 AuditService auditService) {
        this.parkingRecordRepository = parkingRecordRepository;
        this.parkingSlotRepository = parkingSlotRepository;
        this.vehicleRepository = vehicleRepository;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }

    public ParkingRecordDto entry(ParkingEntryRequest request, String userId) {
        // 1. Load + verify vehicle ownership
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> AppException.notFound("Vehicle not found with id: " + request.getVehicleId()));

        if (!vehicle.getUserId().equals(userId)) {
            throw AppException.forbidden("You do not own this vehicle");
        }

        if (!vehicle.isActive()) {
            throw AppException.badRequest("Vehicle is inactive");
        }

        // 2. Check no active session for vehicle
        Optional<ParkingRecord> activeSession = parkingRecordRepository
                .findFirstByVehicleIdAndStatus(vehicle.getId(), SessionStatus.ACTIVE);
        if (activeSession.isPresent()) {
            throw AppException.conflict("Vehicle already has an active parking session");
        }

        // 3. Find compatible available slot (prefer preferredSlotId if given and compatible)
        ParkingSlot selectedSlot = null;

        if (request.getPreferredSlotId() != null && !request.getPreferredSlotId().isBlank()) {
            Optional<ParkingSlot> preferredOpt = parkingSlotRepository.findById(request.getPreferredSlotId());
            if (preferredOpt.isPresent()) {
                ParkingSlot pref = preferredOpt.get();
                if (pref.getStatus() == SlotStatus.AVAILABLE && isCompatible(vehicle.getVehicleType(), pref.getSlotType())) {
                    selectedSlot = pref;
                }
            }
        }

        if (selectedSlot == null) {
            SlotType targetSlotType = mapVehicleTypeToSlotType(vehicle.getVehicleType());
            List<ParkingSlot> availableSlots = parkingSlotRepository.findByStatusAndSlotType(SlotStatus.AVAILABLE, targetSlotType);
            if (!availableSlots.isEmpty()) {
                selectedSlot = availableSlots.get(0);
            } else {
                // Try fallback for electric/accessible to four-wheeler
                if (vehicle.getVehicleType() == VehicleType.ELECTRIC || vehicle.getVehicleType() == VehicleType.ACCESSIBLE) {
                    List<ParkingSlot> fallbackSlots = parkingSlotRepository.findByStatusAndSlotType(SlotStatus.AVAILABLE, SlotType.FOUR_WHEELER);
                    if (!fallbackSlots.isEmpty()) {
                        selectedSlot = fallbackSlots.get(0);
                    }
                }
            }
        }

        if (selectedSlot == null) {
            throw AppException.badRequest("No compatible parking slot is currently available for vehicle type: " + vehicle.getVehicleType());
        }

        // 4. Create ParkingRecord
        Instant now = Instant.now();
        ParkingRecord record = ParkingRecord.builder()
                .vehicleId(vehicle.getId())
                .vehicleNumber(vehicle.getRegistrationNumber())
                .slotId(selectedSlot.getId())
                .slotNumber(selectedSlot.getSlotNumber())
                .userId(userId)
                .entryTime(now)
                .status(SessionStatus.ACTIVE)
                .createdAt(now)
                .updatedAt(now)
                .build();

        ParkingRecord savedRecord = parkingRecordRepository.save(record);

        // 5. Update slot atomically/consistently
        selectedSlot.setStatus(SlotStatus.OCCUPIED);
        selectedSlot.setVehicleId(vehicle.getId());
        selectedSlot.setActiveParkingRecordId(savedRecord.getId());
        selectedSlot.setUpdatedAt(now);
        parkingSlotRepository.save(selectedSlot);

        // 6. Create notification
        notificationService.create(
                userId,
                "Parking Check-In",
                String.format("Vehicle %s checked into slot %s at %s", vehicle.getRegistrationNumber(), selectedSlot.getSlotNumber(), now),
                "PARKING_ENTRY"
        );

        auditService.log(userId, "PARKING_ENTRY", "ParkingRecord", savedRecord.getId(),
                Map.of("vehicleNumber", vehicle.getRegistrationNumber(), "slotNumber", selectedSlot.getSlotNumber()));

        return mapToDto(savedRecord);
    }

    public ParkingRecordDto exit(String recordId, String userId, Role role) {
        // 1. Load record
        ParkingRecord record = parkingRecordRepository.findById(recordId)
                .orElseThrow(() -> AppException.notFound("Parking record not found with id: " + recordId));

        // Verify ownership or admin
        if (role != Role.ADMIN && !record.getUserId().equals(userId)) {
            throw AppException.forbidden("Not authorized to exit this parking session");
        }

        // 2. Verify status == ACTIVE
        if (record.getStatus() != SessionStatus.ACTIVE) {
            throw AppException.badRequest("This parking session is already completed");
        }

        Instant now = Instant.now();
        record.setExitTime(now);
        record.setStatus(SessionStatus.COMPLETED);
        record.setUpdatedAt(now);

        ParkingRecord savedRecord = parkingRecordRepository.save(record);

        // Release slot
        Optional<ParkingSlot> slotOpt = parkingSlotRepository.findById(record.getSlotId());
        if (slotOpt.isPresent()) {
            ParkingSlot slot = slotOpt.get();
            slot.setStatus(SlotStatus.AVAILABLE);
            slot.setVehicleId(null);
            slot.setActiveParkingRecordId(null);
            slot.setUpdatedAt(now);
            parkingSlotRepository.save(slot);
        }

        // Notification
        notificationService.create(
                record.getUserId(),
                "Parking Check-Out",
                String.format("Vehicle %s checked out from slot %s at %s", record.getVehicleNumber(), record.getSlotNumber(), now),
                "PARKING_EXIT"
        );

        auditService.log(userId, "PARKING_EXIT", "ParkingRecord", savedRecord.getId(),
                Map.of("vehicleNumber", record.getVehicleNumber(), "slotNumber", record.getSlotNumber()));

        return mapToDto(savedRecord);
    }

    public List<ParkingRecordDto> getActiveSessions(String userId) {
        List<ParkingRecord> records = parkingRecordRepository.findByUserIdAndStatus(userId, SessionStatus.ACTIVE);
        return records.stream().map(this::mapToDto).toList();
    }

    public List<ParkingRecordDto> getAllActiveSessions() {
        List<ParkingRecord> records = parkingRecordRepository.findByStatus(SessionStatus.ACTIVE);
        return records.stream().map(this::mapToDto).toList();
    }

    public PagedResponse<ParkingRecordDto> getHistory(String userId, Pageable pageable) {
        Page<ParkingRecord> page = parkingRecordRepository.findByUserId(userId, pageable);
        return PagedResponse.<ParkingRecordDto>builder()
                .content(page.getContent().stream().map(this::mapToDto).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    public PagedResponse<ParkingRecordDto> getAllHistory(Pageable pageable) {
        Page<ParkingRecord> page = parkingRecordRepository.findAll(pageable);
        return PagedResponse.<ParkingRecordDto>builder()
                .content(page.getContent().stream().map(this::mapToDto).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    private boolean isCompatible(VehicleType vehicleType, SlotType slotType) {
        if (slotType == SlotType.OTHER) return true;
        return switch (vehicleType) {
            case TWO_WHEELER -> slotType == SlotType.TWO_WHEELER;
            case FOUR_WHEELER -> slotType == SlotType.FOUR_WHEELER;
            case ACCESSIBLE -> slotType == SlotType.ACCESSIBLE || slotType == SlotType.FOUR_WHEELER;
            case ELECTRIC -> slotType == SlotType.ELECTRIC || slotType == SlotType.FOUR_WHEELER;
            case OTHER -> slotType == SlotType.FOUR_WHEELER || slotType == SlotType.OTHER;
        };
    }

    private SlotType mapVehicleTypeToSlotType(VehicleType vehicleType) {
        return switch (vehicleType) {
            case TWO_WHEELER -> SlotType.TWO_WHEELER;
            case FOUR_WHEELER -> SlotType.FOUR_WHEELER;
            case ACCESSIBLE -> SlotType.ACCESSIBLE;
            case ELECTRIC -> SlotType.ELECTRIC;
            case OTHER -> SlotType.OTHER;
        };
    }

    public ParkingRecordDto mapToDto(ParkingRecord record) {
        return ParkingRecordDto.builder()
                .id(record.getId())
                .vehicleId(record.getVehicleId())
                .vehicleNumber(record.getVehicleNumber())
                .slotId(record.getSlotId())
                .slotNumber(record.getSlotNumber())
                .userId(record.getUserId())
                .entryTime(record.getEntryTime())
                .exitTime(record.getExitTime())
                .status(record.getStatus())
                .createdAt(record.getCreatedAt())
                .updatedAt(record.getUpdatedAt())
                .build();
    }
}
