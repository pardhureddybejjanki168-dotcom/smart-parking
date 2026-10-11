package com.parking.controller;

import com.parking.dto.ApiResponse;
import com.parking.dto.PagedResponse;
import com.parking.dto.ParkingSlotDto;
import com.parking.model.SlotStatus;
import com.parking.model.SlotType;
import com.parking.service.ParkingSlotService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/parking-slots")
public class ParkingSlotController {

    private final ParkingSlotService parkingSlotService;

    public ParkingSlotController(ParkingSlotService parkingSlotService) {
        this.parkingSlotService = parkingSlotService;
    }

    @GetMapping
    public ResponseEntity<PagedResponse<ParkingSlotDto>> getAllSlots(
            @RequestParam(required = false) SlotStatus status,
            @RequestParam(required = false) SlotType slotType,
            @PageableDefault(sort = "slotNumber", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(parkingSlotService.getAllSlots(status, slotType, pageable));
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<ParkingSlotDto>>> getAvailableSlots(
            @RequestParam(required = false) SlotType slotType) {
        List<ParkingSlotDto> available = parkingSlotService.getAvailableSlots(slotType);
        return ResponseEntity.ok(ApiResponse.ok(available));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getSlotStats() {
        Map<String, Long> stats = parkingSlotService.getSlotStats();
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ParkingSlotDto>> getSlot(@PathVariable String id) {
        ParkingSlotDto slot = parkingSlotService.getSlot(id);
        return ResponseEntity.ok(ApiResponse.ok(slot));
    }
}
