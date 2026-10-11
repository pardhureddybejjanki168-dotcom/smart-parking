package com.parking.repository;

import com.parking.model.ParkingRecord;
import com.parking.model.SessionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface ParkingRecordRepository extends MongoRepository<ParkingRecord, String> {
    List<ParkingRecord> findByUserIdAndStatus(String userId, SessionStatus status);
    List<ParkingRecord> findByStatus(SessionStatus status);
    Page<ParkingRecord> findByStatus(SessionStatus status, Pageable pageable);
    Optional<ParkingRecord> findFirstByVehicleIdAndStatus(String vehicleId, SessionStatus status);
    Optional<ParkingRecord> findFirstBySlotIdAndStatus(String slotId, SessionStatus status);
    Page<ParkingRecord> findByUserId(String userId, Pageable pageable);
    long countByStatus(SessionStatus status);
    long countByUserIdAndStatus(String userId, SessionStatus status);
    List<ParkingRecord> findByEntryTimeBetween(Instant start, Instant end);
    List<ParkingRecord> findByUserIdAndEntryTimeBetween(String userId, Instant start, Instant end);
    long countByStatusAndExitTimeBetween(SessionStatus status, Instant start, Instant end);
}
