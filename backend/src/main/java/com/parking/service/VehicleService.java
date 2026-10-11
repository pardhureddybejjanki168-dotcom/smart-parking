package com.parking.service;

import com.parking.dto.PagedResponse;
import com.parking.dto.VehicleDto;
import com.parking.dto.VehicleRequest;
import com.parking.exception.AppException;
import com.parking.model.Role;
import com.parking.model.SessionStatus;
import com.parking.model.Vehicle;
import com.parking.repository.ParkingRecordRepository;
import com.parking.repository.VehicleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;

@Service
public class VehicleService {

    private static final Logger log = LoggerFactory.getLogger(VehicleService.class);

    private final VehicleRepository vehicleRepository;
    private final ParkingRecordRepository parkingRecordRepository;
    private final AuditService auditService;

    public VehicleService(VehicleRepository vehicleRepository,
                          ParkingRecordRepository parkingRecordRepository,
                          AuditService auditService) {
        this.vehicleRepository = vehicleRepository;
        this.parkingRecordRepository = parkingRecordRepository;
        this.auditService = auditService;
    }

    public VehicleDto createVehicle(VehicleRequest request, String userId) {
        String normalizedReg = request.getRegistrationNumber().trim().toUpperCase().replaceAll("[^A-Z0-9]", "");

        if (vehicleRepository.existsByNormalizedRegistrationNumber(normalizedReg)) {
            throw AppException.conflict("A vehicle with registration number " + request.getRegistrationNumber() + " already exists");
        }

        Vehicle vehicle = Vehicle.builder()
                .registrationNumber(request.getRegistrationNumber().trim().toUpperCase())
                .normalizedRegistrationNumber(normalizedReg)
                .vehicleType(request.getVehicleType())
                .make(request.getMake())
                .model(request.getModel())
                .color(request.getColor())
                .ownerName(request.getOwnerName())
                .ownerPhone(request.getOwnerPhone())
                .userId(userId)
                .active(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        Vehicle saved = vehicleRepository.save(vehicle);

        auditService.log(userId, "VEHICLE_CREATED", "Vehicle", saved.getId(),
                Map.of("registrationNumber", saved.getRegistrationNumber()));

        return mapToDto(saved);
    }

    public PagedResponse<VehicleDto> getVehiclesForUser(String userId, Pageable pageable) {
        Page<Vehicle> page = vehicleRepository.findByUserId(userId, pageable);
        return PagedResponse.<VehicleDto>builder()
                .content(page.getContent().stream().map(this::mapToDto).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    public PagedResponse<VehicleDto> getAllVehicles(Pageable pageable) {
        Page<Vehicle> page = vehicleRepository.findAll(pageable);
        return PagedResponse.<VehicleDto>builder()
                .content(page.getContent().stream().map(this::mapToDto).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    public VehicleDto getVehicle(String id, String userId, Role role) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Vehicle not found with id: " + id));

        if (role != Role.ADMIN && !vehicle.getUserId().equals(userId)) {
            throw AppException.forbidden("You are not authorized to view this vehicle");
        }

        return mapToDto(vehicle);
    }

    public VehicleDto updateVehicle(String id, VehicleRequest request, String userId, Role role) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Vehicle not found with id: " + id));

        if (role != Role.ADMIN && !vehicle.getUserId().equals(userId)) {
            throw AppException.forbidden("You are not authorized to modify this vehicle");
        }

        String normalizedReg = request.getRegistrationNumber().trim().toUpperCase().replaceAll("[^A-Z0-9]", "");
        if (!vehicle.getNormalizedRegistrationNumber().equals(normalizedReg) &&
                vehicleRepository.existsByNormalizedRegistrationNumber(normalizedReg)) {
            throw AppException.conflict("Registration number is already in use by another vehicle");
        }

        vehicle.setRegistrationNumber(request.getRegistrationNumber().trim().toUpperCase());
        vehicle.setNormalizedRegistrationNumber(normalizedReg);
        vehicle.setVehicleType(request.getVehicleType());
        vehicle.setMake(request.getMake());
        vehicle.setModel(request.getModel());
        vehicle.setColor(request.getColor());
        vehicle.setOwnerName(request.getOwnerName());
        vehicle.setOwnerPhone(request.getOwnerPhone());
        vehicle.setUpdatedAt(Instant.now());

        Vehicle updated = vehicleRepository.save(vehicle);

        auditService.log(userId, "VEHICLE_UPDATED", "Vehicle", updated.getId(),
                Map.of("registrationNumber", updated.getRegistrationNumber()));

        return mapToDto(updated);
    }

    public void deactivateVehicle(String id, String userId, Role role) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Vehicle not found with id: " + id));

        if (role != Role.ADMIN && !vehicle.getUserId().equals(userId)) {
            throw AppException.forbidden("You are not authorized to deactivate this vehicle");
        }

        boolean hasActiveSession = parkingRecordRepository
                .findFirstByVehicleIdAndStatus(id, SessionStatus.ACTIVE)
                .isPresent();

        if (hasActiveSession) {
            throw AppException.badRequest("Cannot deactivate vehicle while it is currently in an active parking session");
        }

        vehicle.setActive(false);
        vehicle.setUpdatedAt(Instant.now());
        vehicleRepository.save(vehicle);

        auditService.log(userId, "VEHICLE_DEACTIVATED", "Vehicle", vehicle.getId(),
                Map.of("registrationNumber", vehicle.getRegistrationNumber()));
    }

    public VehicleDto mapToDto(Vehicle vehicle) {
        return VehicleDto.builder()
                .id(vehicle.getId())
                .registrationNumber(vehicle.getRegistrationNumber())
                .vehicleType(vehicle.getVehicleType())
                .make(vehicle.getMake())
                .model(vehicle.getModel())
                .color(vehicle.getColor())
                .ownerName(vehicle.getOwnerName())
                .ownerPhone(vehicle.getOwnerPhone())
                .active(vehicle.isActive())
                .createdAt(vehicle.getCreatedAt())
                .updatedAt(vehicle.getUpdatedAt())
                .build();
    }
}
