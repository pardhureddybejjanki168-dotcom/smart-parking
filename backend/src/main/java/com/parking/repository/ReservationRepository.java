package com.parking.repository;

import com.parking.model.Reservation;
import com.parking.model.ReservationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Collection;
import java.util.List;

@Repository
public interface ReservationRepository extends MongoRepository<Reservation, String> {
    Page<Reservation> findByUserId(String userId, Pageable pageable);
    List<Reservation> findByUserId(String userId);
    List<Reservation> findBySlotIdAndStatusIn(String slotId, Collection<ReservationStatus> statuses);
    List<Reservation> findByUserIdAndStatus(String userId, ReservationStatus status);
    List<Reservation> findByStatus(ReservationStatus status);
    List<Reservation> findByStatusAndEndTimeBefore(ReservationStatus status, Instant time);
    long countByStatus(ReservationStatus status);
}
