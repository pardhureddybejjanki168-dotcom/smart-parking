package com.parking.dto;

import com.parking.model.SlotStatus;
import com.parking.model.SlotType;

import java.time.Instant;

public class ParkingSlotDto {
    private String id;
    private String slotNumber;
    private SlotType slotType;
    private SlotStatus status;
    private String vehicleId;
    private String currentVehicleNumber;
    private String activeParkingRecordId;
    private Instant createdAt;
    private Instant updatedAt;

    public ParkingSlotDto() {
    }

    public ParkingSlotDto(String id, String slotNumber, SlotType slotType, SlotStatus status,
                          String vehicleId, String currentVehicleNumber, String activeParkingRecordId,
                          Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.slotNumber = slotNumber;
        this.slotType = slotType;
        this.status = status;
        this.vehicleId = vehicleId;
        this.currentVehicleNumber = currentVehicleNumber;
        this.activeParkingRecordId = activeParkingRecordId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String slotNumber;
        private SlotType slotType;
        private SlotStatus status;
        private String vehicleId;
        private String currentVehicleNumber;
        private String activeParkingRecordId;
        private Instant createdAt;
        private Instant updatedAt;

        public Builder id(String id) {
            this.id = id;
            return this;
        }

        public Builder slotNumber(String slotNumber) {
            this.slotNumber = slotNumber;
            return this;
        }

        public Builder slotType(SlotType slotType) {
            this.slotType = slotType;
            return this;
        }

        public Builder status(SlotStatus status) {
            this.status = status;
            return this;
        }

        public Builder vehicleId(String vehicleId) {
            this.vehicleId = vehicleId;
            return this;
        }

        public Builder currentVehicleNumber(String currentVehicleNumber) {
            this.currentVehicleNumber = currentVehicleNumber;
            return this;
        }

        public Builder activeParkingRecordId(String activeParkingRecordId) {
            this.activeParkingRecordId = activeParkingRecordId;
            return this;
        }

        public Builder createdAt(Instant createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Builder updatedAt(Instant updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public ParkingSlotDto build() {
            return new ParkingSlotDto(id, slotNumber, slotType, status, vehicleId, currentVehicleNumber, activeParkingRecordId, createdAt, updatedAt);
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSlotNumber() {
        return slotNumber;
    }

    public void setSlotNumber(String slotNumber) {
        this.slotNumber = slotNumber;
    }

    public SlotType getSlotType() {
        return slotType;
    }

    public void setSlotType(SlotType slotType) {
        this.slotType = slotType;
    }

    public SlotStatus getStatus() {
        return status;
    }

    public void setStatus(SlotStatus status) {
        this.status = status;
    }

    public String getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(String vehicleId) {
        this.vehicleId = vehicleId;
    }

    public String getCurrentVehicleNumber() {
        return currentVehicleNumber;
    }

    public void setCurrentVehicleNumber(String currentVehicleNumber) {
        this.currentVehicleNumber = currentVehicleNumber;
    }

    public String getActiveParkingRecordId() {
        return activeParkingRecordId;
    }

    public void setActiveParkingRecordId(String activeParkingRecordId) {
        this.activeParkingRecordId = activeParkingRecordId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
