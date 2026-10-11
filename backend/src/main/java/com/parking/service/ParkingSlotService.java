package com.parking.service;

import com.parking.dto.PagedResponse;
import com.parking.dto.ParkingSlotDto;
import com.parking.dto.ParkingSlotRequest;
import com.parking.exception.AppException;
import com.parking.model.ParkingSlot;
import com.parking.model.SlotStatus;
import com.parking.model.SlotType;
import com.parking.model.Vehicle;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.VehicleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ParkingSlotService {

    private static final Logger log = LoggerFactory.getLogger(ParkingSlotService.class);

    private final ParkingSlotRepository parkingSlotRepository;
    private final VehicleRepository vehicleRepository;
    private final AuditService auditService;

    public ParkingSlotService(ParkingSlotRepository parkingSlotRepository,
                               VehicleRepository vehicleRepository,
                               AuditService auditService) {
        this.parkingSlotRepository = parkingSlotRepository;
        this.vehicleRepository = vehicleRepository;
        this.auditService = auditService;
    }

    public ParkingSlotDto createSlot(ParkingSlotRequest request, String adminId) {
        String slotNum = request.getSlotNumber().trim().toUpperCase();
        if (parkingSlotRepository.existsBySlotNumber(slotNum)) {
            throw AppException.conflict("Slot number " + slotNum + " already exists");
        }
        ParkingSlot slot = ParkingSlot.builder()
                .slotNumber(slotNum)
                .slotType(request.getSlotType())
                .status(SlotStatus.AVAILABLE)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        ParkingSlot saved = parkingSlotRepository.save(slot);
        auditService.log(adminId, "SLOT_CREATED", "ParkingSlot", saved.getId(),
                Map.of("slotNumber", saved.getSlotNumber(), "slotType", saved.getSlotType().name()));
        return mapToDto(saved);
    }

    public PagedResponse<ParkingSlotDto> getAllSlots(SlotStatus status, SlotType slotType, Pageable pageable) {
        Page<ParkingSlot> page;
        if (status != null && slotType != null) {
            page = parkingSlotRepository.findByStatusAndSlotType(status, slotType, pageable);
        } else if (status != null) {
            page = parkingSlotRepository.findByStatus(status, pageable);
        } else if (slotType != null) {
            page = parkingSlotRepository.findBySlotType(slotType, pageable);
        } else {
            page = parkingSlotRepository.findAll(pageable);
        }
        return PagedResponse.<ParkingSlotDto>builder()
                .content(page.getContent().stream().map(this::mapToDto).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    public List<ParkingSlotDto> getAvailableSlots(SlotType slotType) {
        List<ParkingSlot> slots = slotType != null
                ? parkingSlotRepository.findByStatusAndSlotType(SlotStatus.AVAILABLE, slotType)
                : parkingSlotRepository.findByStatus(SlotStatus.AVAILABLE);
        return slots.stream().map(this::mapToDto).toList();
    }

    public ParkingSlotDto getSlot(String id) {
        ParkingSlot slot = parkingSlotRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Parking slot not found with id: " + id));
        return mapToDto(slot);
    }

    public ParkingSlotDto updateSlot(String id, ParkingSlotRequest request, String adminId) {
        ParkingSlot slot = parkingSlotRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Parking slot not found with id: " + id));
        String newSlotNum = request.getSlotNumber().trim().toUpperCase();
        if (!slot.getSlotNumber().equalsIgnoreCase(newSlotNum) && parkingSlotRepository.existsBySlotNumber(newSlotNum)) {
            throw AppException.conflict("Slot number " + newSlotNum + " already exists");
        }
        slot.setSlotNumber(newSlotNum);
        slot.setSlotType(request.getSlotType());
        slot.setUpdatedAt(Instant.now());
        ParkingSlot updated = parkingSlotRepository.save(slot);
        auditService.log(adminId, "SLOT_UPDATED", "ParkingSlot", updated.getId(),
                Map.of("slotNumber", updated.getSlotNumber()));
        return mapToDto(updated);
    }

    public ParkingSlotDto updateSlotStatus(String id, SlotStatus newStatus, String adminId) {
        ParkingSlot slot = parkingSlotRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Parking slot not found with id: " + id));
        if (slot.getStatus() == SlotStatus.OCCUPIED && newStatus != SlotStatus.OCCUPIED) {
            throw AppException.badRequest("Cannot alter status while slot is actively occupied. Release session first.");
        }
        if (newStatus == SlotStatus.OCCUPIED && slot.getStatus() != SlotStatus.OCCUPIED) {
            throw AppException.badRequest("Slot can only be marked OCCUPIED through an active parking session entry");
        }
        slot.setStatus(newStatus);
        slot.setUpdatedAt(Instant.now());
        ParkingSlot updated = parkingSlotRepository.save(slot);
        auditService.log(adminId, "SLOT_STATUS_UPDATED", "ParkingSlot", updated.getId(),
                Map.of("newStatus", newStatus.name()));
        return mapToDto(updated);
    }

    public Map<String, Long> getSlotStats() {
        Map<String, Long> stats = new HashMap<>();
        for (SlotStatus status : SlotStatus.values()) {
            stats.put(status.name(), parkingSlotRepository.countByStatus(status));
        }
        stats.put("TOTAL", parkingSlotRepository.count());
        return stats;
    }

    public ParkingSlotDto mapToDto(ParkingSlot slot) {
        String currentVehicleNumber = null;
        if (slot.getVehicleId() != null) {
            currentVehicleNumber = vehicleRepository.findById(slot.getVehicleId())
                    .map(Vehicle::getRegistrationNumber).orElse(null);
        }
        return ParkingSlotDto.builder()
                .id(slot.getId())
                .slotNumber(slot.getSlotNumber())
                .slotType(slot.getSlotType())
                .status(slot.getStatus())
                .vehicleId(slot.getVehicleId())
                .currentVehicleNumber(currentVehicleNumber)
                .activeParkingRecordId(slot.getActiveParkingRecordId())
                .createdAt(slot.getCreatedAt())
                .updatedAt(slot.getUpdatedAt())
                .build();
    }
}
