package com.parking.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "parking_slots")
public class ParkingSlot {
    @Id
    private String id;

    @Indexed(unique = true)
    private String slotNumber;

    private SlotType slotType;

    private SlotStatus status;

    private String vehicleId;

    private String activeParkingRecordId;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public ParkingSlot() {
    }

    public ParkingSlot(String id, String slotNumber, SlotType slotType, SlotStatus status,
                       String vehicleId, String activeParkingRecordId, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.slotNumber = slotNumber;
        this.slotType = slotType;
        this.status = status;
        this.vehicleId = vehicleId;
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

        public ParkingSlot build() {
            return new ParkingSlot(id, slotNumber, slotType, status, vehicleId, activeParkingRecordId, createdAt, updatedAt);
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
