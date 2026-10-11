package com.parking.repository;

import com.parking.model.Vehicle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends MongoRepository<Vehicle, String> {
    Page<Vehicle> findByUserId(String userId, Pageable pageable);
    List<Vehicle> findByUserId(String userId);
    Optional<Vehicle> findByNormalizedRegistrationNumber(String normalizedRegistrationNumber);
    boolean existsByNormalizedRegistrationNumber(String normalizedRegistrationNumber);
    long countByUserId(String userId);
}
