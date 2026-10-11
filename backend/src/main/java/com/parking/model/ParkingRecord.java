package com.parking.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "parking_records")
public class ParkingRecord {
    @Id
    private String id;

    @Indexed
    private String vehicleId;

    private String vehicleNumber;

    @Indexed
    private String slotId;

    private String slotNumber;

    @Indexed
    private String userId;

    private Instant entryTime;

    private Instant exitTime;

    @Indexed
    private SessionStatus status;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public ParkingRecord() {
    }

    public ParkingRecord(String id, String vehicleId, String vehicleNumber, String slotId,
                         String slotNumber, String userId, Instant entryTime, Instant exitTime,
                         SessionStatus status, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.vehicleId = vehicleId;
        this.vehicleNumber = vehicleNumber;
        this.slotId = slotId;
        this.slotNumber = slotNumber;
        this.userId = userId;
        this.entryTime = entryTime;
        this.exitTime = exitTime;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String vehicleId;
        private String vehicleNumber;
        private String slotId;
        private String slotNumber;
        private String userId;
        private Instant entryTime;
        private Instant exitTime;
        private SessionStatus status;
        private Instant createdAt;
        private Instant updatedAt;

        public Builder id(String id) {
            this.id = id;
            return this;
        }

        public Builder vehicleId(String vehicleId) {
            this.vehicleId = vehicleId;
            return this;
        }

        public Builder vehicleNumber(String vehicleNumber) {
            this.vehicleNumber = vehicleNumber;
            return this;
        }

        public Builder slotId(String slotId) {
            this.slotId = slotId;
            return this;
        }

        public Builder slotNumber(String slotNumber) {
            this.slotNumber = slotNumber;
            return this;
        }

        public Builder userId(String userId) {
            this.userId = userId;
            return this;
        }

        public Builder entryTime(Instant entryTime) {
            this.entryTime = entryTime;
            return this;
        }

        public Builder exitTime(Instant exitTime) {
            this.exitTime = exitTime;
            return this;
        }

        public Builder status(SessionStatus status) {
            this.status = status;
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

        public ParkingRecord build() {
            return new ParkingRecord(id, vehicleId, vehicleNumber, slotId, slotNumber,
                    userId, entryTime, exitTime, status, createdAt, updatedAt);
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(String vehicleId) {
        this.vehicleId = vehicleId;
    }

    public String getVehicleNumber() {
        return vehicleNumber;
    }

    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }

    public String getSlotId() {
        return slotId;
    }

    public void setSlotId(String slotId) {
        this.slotId = slotId;
    }

    public String getSlotNumber() {
        return slotNumber;
    }

    public void setSlotNumber(String slotNumber) {
        this.slotNumber = slotNumber;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Instant getEntryTime() {
        return entryTime;
    }

    public void setEntryTime(Instant entryTime) {
        this.entryTime = entryTime;
    }

    public Instant getExitTime() {
        return exitTime;
    }

    public void setExitTime(Instant exitTime) {
        this.exitTime = exitTime;
    }

    public SessionStatus getStatus() {
        return status;
    }

    public void setStatus(SessionStatus status) {
        this.status = status;
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
