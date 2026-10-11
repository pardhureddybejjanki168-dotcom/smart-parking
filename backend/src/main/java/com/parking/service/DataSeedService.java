package com.parking.service;

import com.parking.model.ParkingRecord;
import com.parking.model.ParkingSlot;
import com.parking.model.Role;
import com.parking.model.SessionStatus;
import com.parking.model.SlotStatus;
import com.parking.model.SlotType;
import com.parking.model.User;
import com.parking.model.Vehicle;
import com.parking.model.VehicleType;
import com.parking.repository.ParkingRecordRepository;
import com.parking.repository.ParkingSlotRepository;
import com.parking.repository.UserRepository;
import com.parking.repository.VehicleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Service
public class DataSeedService implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeedService.class);

    private final ParkingSlotRepository parkingSlotRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final ParkingRecordRepository parkingRecordRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.enabled:true}")
    private boolean seedEnabled;

    @Value("${app.admin.email:admin@parking.local}")
    private String adminEmail;

    public DataSeedService(ParkingSlotRepository parkingSlotRepository,
                           UserRepository userRepository,
                           VehicleRepository vehicleRepository,
                           ParkingRecordRepository parkingRecordRepository,
                           PasswordEncoder passwordEncoder) {
        this.parkingSlotRepository = parkingSlotRepository;
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.parkingRecordRepository = parkingRecordRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!seedEnabled) {
            log.info("Data seeding is disabled (app.seed.enabled=false)");
            return;
        }

        if (parkingSlotRepository.count() > 0) {
            log.info("Database already contains parking slots; skipping initial seed");
            return;
        }

        log.info("Starting initial database seeding...");

        // 1. Create Parking Slots
        List<ParkingSlot> slots = new ArrayList<>();
        Instant now = Instant.now();

        // 10 FOUR_WHEELER slots (F01-F10)
        for (int i = 1; i <= 10; i++) {
            slots.add(ParkingSlot.builder()
                    .slotNumber(String.format("F%02d", i))
                    .slotType(SlotType.FOUR_WHEELER)
                    .status(SlotStatus.AVAILABLE)
                    .createdAt(now)
                    .updatedAt(now)
                    .build());
        }

        // 5 TWO_WHEELER slots (T01-T05)
        for (int i = 1; i <= 5; i++) {
            slots.add(ParkingSlot.builder()
                    .slotNumber(String.format("T%02d", i))
                    .slotType(SlotType.TWO_WHEELER)
                    .status(SlotStatus.AVAILABLE)
                    .createdAt(now)
                    .updatedAt(now)
                    .build());
        }

        // 2 ELECTRIC slots (E01-E02)
        for (int i = 1; i <= 2; i++) {
            slots.add(ParkingSlot.builder()
                    .slotNumber(String.format("E%02d", i))
                    .slotType(SlotType.ELECTRIC)
                    .status(SlotStatus.AVAILABLE)
                    .createdAt(now)
                    .updatedAt(now)
                    .build());
        }

        // 1 ACCESSIBLE slot (A01)
        slots.add(ParkingSlot.builder()
                .slotNumber("A01")
                .slotType(SlotType.ACCESSIBLE)
                .status(SlotStatus.AVAILABLE)
                .createdAt(now)
                .updatedAt(now)
                .build());

        List<ParkingSlot> savedSlots = parkingSlotRepository.saveAll(slots);
        log.info("Seeded {} parking slots successfully", savedSlots.size());

        // 2. Admin User
        String normalizedAdminEmail = adminEmail.trim().toLowerCase();
        User adminUser = userRepository.findByNormalizedEmail(normalizedAdminEmail).orElse(null);
        if (adminUser == null) {
            byte[] randomBytes = new byte[12];
            new SecureRandom().nextBytes(randomBytes);
            String adminPassword = "Admin@" + Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes).substring(0, 8);

            adminUser = User.builder()
                    .fullName("System Administrator")
                    .email(adminEmail.trim())
                    .normalizedEmail(normalizedAdminEmail)
                    .phone("+1000000000")
                    .passwordHash(passwordEncoder.encode(adminPassword))
                    .role(Role.ADMIN)
                    .active(true)
                    .createdAt(now)
                    .updatedAt(now)
                    .build();
            userRepository.save(adminUser);

            System.out.println("==================================================");
            System.out.println(" ADMIN CREDENTIALS CREATED:");
            System.out.println(" Email:    " + adminEmail);
            System.out.println(" Password: " + adminPassword);
            System.out.println("==================================================");
            log.info("Admin user created with email: {}", adminEmail);
        }

        // 3. Demo Users
        String demoPass = "Password123!";
        String encodedDemoPass = passwordEncoder.encode(demoPass);

        User demoUser1 = userRepository.findByNormalizedEmail("john.doe@example.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .fullName("John Doe")
                        .email("john.doe@example.com")
                        .normalizedEmail("john.doe@example.com")
                        .phone("+15551234567")
                        .passwordHash(encodedDemoPass)
                        .role(Role.USER)
                        .active(true)
                        .createdAt(now)
                        .updatedAt(now)
                        .build())
        );

        User demoUser2 = userRepository.findByNormalizedEmail("jane.smith@example.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .fullName("Jane Smith")
                        .email("jane.smith@example.com")
                        .normalizedEmail("jane.smith@example.com")
                        .phone("+15559876543")
                        .passwordHash(encodedDemoPass)
                        .role(Role.USER)
                        .active(true)
                        .createdAt(now)
                        .updatedAt(now)
                        .build())
        );
        log.info("Demo users created: john.doe@example.com, jane.smith@example.com (Password: {})", demoPass);

        // 4. Demo Vehicles
        Vehicle vehicle1 = vehicleRepository.findByNormalizedRegistrationNumber("KA01AB1234").orElseGet(() ->
                vehicleRepository.save(Vehicle.builder()
                        .registrationNumber("KA-01-AB-1234")
                        .normalizedRegistrationNumber("KA01AB1234")
                        .vehicleType(VehicleType.FOUR_WHEELER)
                        .make("Honda")
                        .model("Civic")
                        .color("Silver")
                        .ownerName("John Doe")
                        .ownerPhone("+15551234567")
                        .userId(demoUser1.getId())
                        .active(true)
                        .createdAt(now)
                        .updatedAt(now)
                        .build())
        );

        Vehicle vehicle2 = vehicleRepository.findByNormalizedRegistrationNumber("MH02CD5678").orElseGet(() ->
                vehicleRepository.save(Vehicle.builder()
                        .registrationNumber("MH-02-CD-5678")
                        .normalizedRegistrationNumber("MH02CD5678")
                        .vehicleType(VehicleType.TWO_WHEELER)
                        .make("Yamaha")
                        .model("FZ")
                        .color("Midnight Blue")
                        .ownerName("John Doe")
                        .ownerPhone("+15551234567")
                        .userId(demoUser1.getId())
                        .active(true)
                        .createdAt(now)
                        .updatedAt(now)
                        .build())
        );

        Vehicle vehicle3 = vehicleRepository.findByNormalizedRegistrationNumber("DL03EF9012").orElseGet(() ->
                vehicleRepository.save(Vehicle.builder()
                        .registrationNumber("DL-03-EF-9012")
                        .normalizedRegistrationNumber("DL03EF9012")
                        .vehicleType(VehicleType.ELECTRIC)
                        .make("Tesla")
                        .model("Model 3")
                        .color("Pearl White")
                        .ownerName("Jane Smith")
                        .ownerPhone("+15559876543")
                        .userId(demoUser2.getId())
                        .active(true)
                        .createdAt(now)
                        .updatedAt(now)
                        .build())
        );
        log.info("Demo vehicles created for demo users");

        // 5. Sample Completed Parking Records
        ParkingSlot sampleSlot1 = savedSlots.get(0);
        ParkingSlot sampleSlot2 = savedSlots.get(1);

        Instant entry1 = now.minus(5, ChronoUnit.HOURS);
        Instant exit1 = now.minus(2, ChronoUnit.HOURS);
        parkingRecordRepository.save(ParkingRecord.builder()
                .vehicleId(vehicle1.getId())
                .vehicleNumber(vehicle1.getRegistrationNumber())
                .slotId(sampleSlot1.getId())
                .slotNumber(sampleSlot1.getSlotNumber())
                .userId(demoUser1.getId())
                .entryTime(entry1)
                .exitTime(exit1)
                .status(SessionStatus.COMPLETED)
                .createdAt(entry1)
                .updatedAt(exit1)
                .build());

        Instant entry2 = now.minus(3, ChronoUnit.HOURS);
        Instant exit2 = now.minus(1, ChronoUnit.HOURS);
        parkingRecordRepository.save(ParkingRecord.builder()
                .vehicleId(vehicle3.getId())
                .vehicleNumber(vehicle3.getRegistrationNumber())
                .slotId(sampleSlot2.getId())
                .slotNumber(sampleSlot2.getSlotNumber())
                .userId(demoUser2.getId())
                .entryTime(entry2)
                .exitTime(exit2)
                .status(SessionStatus.COMPLETED)
                .createdAt(entry2)
                .updatedAt(exit2)
                .build());

        log.info("Database seeding finished successfully");
    }
}
