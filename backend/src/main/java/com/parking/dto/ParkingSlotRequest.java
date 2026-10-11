package com.parking.dto;

import com.parking.model.SlotType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ParkingSlotRequest {
    @NotBlank(message = "Slot number is required")
    private String slotNumber;

    @NotNull(message = "Slot type is required")
    private SlotType slotType;

    public ParkingSlotRequest() {
    }

    public ParkingSlotRequest(String slotNumber, SlotType slotType) {
        this.slotNumber = slotNumber;
        this.slotType = slotType;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String slotNumber;
        private SlotType slotType;

        public Builder slotNumber(String slotNumber) {
            this.slotNumber = slotNumber;
            return this;
        }

        public Builder slotType(SlotType slotType) {
            this.slotType = slotType;
            return this;
        }

        public ParkingSlotRequest build() {
            return new ParkingSlotRequest(slotNumber, slotType);
        }
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
}
