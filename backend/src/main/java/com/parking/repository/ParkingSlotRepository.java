package com.parking.repository;

import com.parking.model.ParkingSlot;
import com.parking.model.SlotStatus;
import com.parking.model.SlotType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParkingSlotRepository extends MongoRepository<ParkingSlot, String> {
    List<ParkingSlot> findByStatus(SlotStatus status);
    List<ParkingSlot> findBySlotType(SlotType slotType);
    List<ParkingSlot> findByStatusAndSlotType(SlotStatus status, SlotType slotType);
    Optional<ParkingSlot> findBySlotNumber(String slotNumber);
    boolean existsBySlotNumber(String slotNumber);
    long countByStatus(SlotStatus status);
    Page<ParkingSlot> findByStatus(SlotStatus status, Pageable pageable);
    Page<ParkingSlot> findBySlotType(SlotType slotType, Pageable pageable);
    Page<ParkingSlot> findByStatusAndSlotType(SlotStatus status, SlotType slotType, Pageable pageable);
}
