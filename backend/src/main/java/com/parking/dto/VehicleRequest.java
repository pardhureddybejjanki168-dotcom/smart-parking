package com.parking.dto;

import com.parking.model.VehicleType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class VehicleRequest {
    @NotBlank(message = "Registration number is required")
    private String registrationNumber;

    @NotNull(message = "Vehicle type is required")
    private VehicleType vehicleType;

    private String make;
    private String model;
    private String color;
    private String ownerName;
    private String ownerPhone;

    public VehicleRequest() {
    }

    public VehicleRequest(String registrationNumber, VehicleType vehicleType, String make,
                          String model, String color, String ownerName, String ownerPhone) {
        this.registrationNumber = registrationNumber;
        this.vehicleType = vehicleType;
        this.make = make;
        this.model = model;
        this.color = color;
        this.ownerName = ownerName;
        this.ownerPhone = ownerPhone;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String registrationNumber;
        private VehicleType vehicleType;
        private String make;
        private String model;
        private String color;
        private String ownerName;
        private String ownerPhone;

        public Builder registrationNumber(String registrationNumber) {
            this.registrationNumber = registrationNumber;
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

        public VehicleRequest build() {
            return new VehicleRequest(registrationNumber, vehicleType, make, model, color, ownerName, ownerPhone);
        }
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
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
}
