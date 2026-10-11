package com.parking.dto;

import jakarta.validation.constraints.NotBlank;

public class ParkingEntryRequest {
    @NotBlank(message = "Vehicle ID is required")
    private String vehicleId;

    private String preferredSlotId;

    public ParkingEntryRequest() {
    }

    public ParkingEntryRequest(String vehicleId, String preferredSlotId) {
        this.vehicleId = vehicleId;
        this.preferredSlotId = preferredSlotId;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String vehicleId;
        private String preferredSlotId;

        public Builder vehicleId(String vehicleId) {
            this.vehicleId = vehicleId;
            return this;
        }

        public Builder preferredSlotId(String preferredSlotId) {
            this.preferredSlotId = preferredSlotId;
            return this;
        }

        public ParkingEntryRequest build() {
            return new ParkingEntryRequest(vehicleId, preferredSlotId);
        }
    }

    public String getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(String vehicleId) {
        this.vehicleId = vehicleId;
    }

    public String getPreferredSlotId() {
        return preferredSlotId;
    }

    public void setPreferredSlotId(String preferredSlotId) {
        this.preferredSlotId = preferredSlotId;
    }
}
