package com.parking.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "vehicles")
public class Vehicle {
    @Id
    private String id;

    private String registrationNumber;

    @Indexed(unique = true)
    private String normalizedRegistrationNumber;

    private VehicleType vehicleType;

    private String make;
    private String model;
    private String color;
    private String ownerName;
    private String ownerPhone;

    @Indexed
    private String userId;

    private boolean active = true;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public Vehicle() {
    }

    public Vehicle(String id, String registrationNumber, String normalizedRegistrationNumber,
                   VehicleType vehicleType, String make, String model, String color,
                   String ownerName, String ownerPhone, String userId, boolean active,
                   Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.registrationNumber = registrationNumber;
        this.normalizedRegistrationNumber = normalizedRegistrationNumber;
        this.vehicleType = vehicleType;
        this.make = make;
        this.model = model;
        this.color = color;
        this.ownerName = ownerName;
        this.ownerPhone = ownerPhone;
        this.userId = userId;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String registrationNumber;
        private String normalizedRegistrationNumber;
        private VehicleType vehicleType;
        private String make;
        private String model;
        private String color;
        private String ownerName;
        private String ownerPhone;
        private String userId;
        private boolean active = true;
        private Instant createdAt;
        private Instant updatedAt;

        public Builder id(String id) {
            this.id = id;
            return this;
        }

        public Builder registrationNumber(String registrationNumber) {
            this.registrationNumber = registrationNumber;
            return this;
        }

        public Builder normalizedRegistrationNumber(String normalizedRegistrationNumber) {
            this.normalizedRegistrationNumber = normalizedRegistrationNumber;
            return this;
        }

        public Builder vehicleType(VehicleType vehicleType) {
            this.vehicleType = vehicleType;
            return this;
        }

        public Builder make(String make) {
            this.make = make;
            return this;
        }

        public Builder model(String model) {
            this.model = model;
            return this;
        }

        public Builder color(String color) {
            this.color = color;
            return this;
        }

        public Builder ownerName(String ownerName) {
            this.ownerName = ownerName;
            return this;
        }

        public Builder ownerPhone(String ownerPhone) {
            this.ownerPhone = ownerPhone;
            return this;
        }

        public Builder userId(String userId) {
            this.userId = userId;
            return this;
        }

        public Builder active(boolean active) {
            this.active = active;
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

        public Vehicle build() {
            return new Vehicle(id, registrationNumber, normalizedRegistrationNumber, vehicleType,
                    make, model, color, ownerName, ownerPhone, userId, active, createdAt, updatedAt);
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public String getNormalizedRegistrationNumber() {
        return normalizedRegistrationNumber;
    }

    public void setNormalizedRegistrationNumber(String normalizedRegistrationNumber) {
        this.normalizedRegistrationNumber = normalizedRegistrationNumber;
    }

    public VehicleType getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(VehicleType vehicleType) {
        this.vehicleType = vehicleType;
    }

    public String getMake() {
        return make;
    }

    public void setMake(String make) {
        this.make = make;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public String getOwnerPhone() {
        return ownerPhone;
    }

    public void setOwnerPhone(String ownerPhone) {
        this.ownerPhone = ownerPhone;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
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
